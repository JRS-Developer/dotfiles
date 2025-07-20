import { Accessor, createBinding, createComputed, createState } from "ags";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalNetwork from "gi://AstalNetwork";
import AstalWp from "gi://AstalWp";
import { spacing } from "../../constants/theme/spacing";
import { getHasVpn } from "../../utils/network";
import { Gtk } from "ags/gtk4";
import { useNotifications } from "../../hooks/useNotifications";
import ControlPanelPopover from "./ControlPanelPopover";

const activeClass = "ControlPanelActiveIcon";

const getVolume = (device: AstalWp.Endpoint) => {
  return Math.round((device.volume ?? 1) * 100);
};

const getWpName = (device: AstalWp.Endpoint) => {
  return device.get_description();
};

const handleVolumeScroll = (
  instance: AstalWp.Endpoint,
  _dx: number,
  dy: number,
) => {
  const currentVolume = getVolume(instance);

  if (dy > 0) {
    instance.set_volume((currentVolume - 1) / 100);
  } else if (currentVolume < 100 || currentVolume > 100) {
    instance.set_volume((currentVolume + 1) / 100);
  }
};

const BluetoothIcon = () => {
  const bluetooth = AstalBluetooth.get_default();
  const isConnected = createBinding(bluetooth, "is_connected");
  const isPowered = createBinding(bluetooth, "is_powered");
  const adapter = createBinding(bluetooth, "adapter");

  const iconName = createComputed(
    [isConnected, isPowered, adapter],
    (_isConnectedBluetooth, isPoweredBluetooth, bluetoothAdapter) => {
      if (bluetoothAdapter === null || bluetoothAdapter === undefined) {
        return "bluetooth-x-symbolic";
      }

      if (isPoweredBluetooth === false) {
        return "bluetooth-none-symbolic";
      }

      return "bluetooth-symbolic";
    },
  );

  const tooltipText = createComputed(
    [isConnected, isPowered, adapter],
    (isConn, isPwr, adapter) => {
      if (!adapter) return "Adaptador Bluetooth no encontrado";
      if (!isPwr) return "Bluetooth está apagado";
      return isConn ? "Bluetooth conectado" : "Bluetooth activado";
    },
  );

  return (
    <image
      iconName={iconName}
      class={isConnected((v) => (v ? activeClass : ""))}
      tooltipText={tooltipText}
    />
  );
};

const NetworkIcon = () => {
  const network = AstalNetwork.get_default();

  const client = createBinding(network, "client");
  const primary = createBinding(network, "primary");
  const connectivity = createBinding(network, "connectivity");
  const state = createBinding(network, "state");
  const wifi = createBinding(network, "wifi");

  const [wifiStrength, setWifiStrength] = createState(
    wifi.get().get_strength() ?? 0,
  );

  const [hasVpn, setHasVpn] = createState(
    getHasVpn(client.get().get_active_connections()),
  );

  wifi.get().connect("notify::strength", () => {
    setWifiStrength(wifi.get()?.get_strength() ?? 0);
  });

  client.get().connect("notify::active-connections", (s) => {
    setHasVpn(getHasVpn(s.get_active_connections()));
  });

  const iconName = createComputed(
    [primary, connectivity, state, wifiStrength],
    (primary, connectivity, state, wifiStrength) => {
      if (state === AstalNetwork.State.CONNECTING) {
        return "radiowaves-dots-symbolic";
      }

      if (
        primary === AstalNetwork.Primary.WIFI &&
        connectivity === AstalNetwork.Connectivity.FULL
      ) {
        if (wifiStrength <= 0) {
          return "radiowaves-4-symbolic";
        } else if (wifiStrength <= 50) {
          return "radiowaves-3-symbolic";
        } else if (wifiStrength <= 75) {
          return "radiowaves-2-symbolic";
        }

        return "radiowaves-1-symbolic";
      }

      if (
        primary === AstalNetwork.Primary.WIRED &&
        connectivity === AstalNetwork.Connectivity.FULL
      ) {
        return "lan-symbolic";
      }

      if (
        connectivity === AstalNetwork.Connectivity.LIMITED ||
        primary === AstalNetwork.Primary.UNKNOWN
      ) {
        return "radiowaves-5-symbolic";
      }

      return "test";
    },
  );

  const tooltipText = createComputed(
    [primary, connectivity, state, hasVpn],
    (primary, connectivity, state, hasVpn) => {
      if (state === AstalNetwork.State.CONNECTING) {
        return "Conectando...";
      }

      if (
        primary === AstalNetwork.Primary.WIFI &&
        connectivity === AstalNetwork.Connectivity.FULL
      ) {
        return hasVpn ? "Wi-Fi conectada (VPN activa)" : "Wi-Fi conectada";
      }

      if (
        primary === AstalNetwork.Primary.WIRED &&
        connectivity === AstalNetwork.Connectivity.FULL
      ) {
        return hasVpn
          ? "Red cableada conectada (VPN activa)"
          : "Red cableada conectada";
      }

      if (connectivity === AstalNetwork.Connectivity.LIMITED) {
        return "Conectividad limitada";
      }

      return "Sin conexión";
    },
  );

  return (
    <box spacing={spacing.small} tooltipText={tooltipText}>
      {/* <label label={primary((p) => p.toString())} /> */}
      {/* <label label={connectivity((p) => p.toString())} /> */}
      {/* <label label={state((p) => p.toString())} /> */}
      <image iconName={iconName} />
      <image iconName={"vpn-caps-symbolic"} visible={hasVpn} />
    </box>
  );
};

const SoundIcon = () => {
  const wp = AstalWp.get_default();

  const defaultMicrophone = createBinding(wp, "defaultMicrophone");
  const defaultSpeaker = createBinding(wp, "defaultSpeaker");

  const [speakerName, setSpeakerName] = createState(
    getWpName(defaultSpeaker.get()),
  );

  const [microName, setMicroName] = createState(
    getWpName(defaultMicrophone.get()),
  );
  const [speakerVolume, setSpeakerVolume] = createState(
    getVolume(defaultSpeaker.get()),
  );
  const [microphoneVolume, setMicrophoneVolume] = createState(
    getVolume(defaultMicrophone.get()),
  );

  const [speakerMuted, setSpeakerMuted] = createState(
    defaultSpeaker.get().mute,
  );

  const [microMuted, setMicroMuted] = createState(defaultMicrophone.get().mute);
  const [microState, setMicroState] = createState(
    defaultMicrophone.get().state,
  );

  const speakerIcon = createComputed(
    [speakerVolume, speakerMuted],
    (v, speakerMuted) => {
      if (v <= 0 || speakerMuted === true) {
        return "speaker-0-symbolic";
      } else if (v <= 30) {
        return "speaker-1-symbolic";
      } else if (v <= 65) {
        return "speaker-2-symbolic";
      }

      return "speaker-3-symbolic";
    },
  );

  const microIcon = createComputed(
    [microphoneVolume, microMuted, microState],
    (v, microMuted) => {
      if (microMuted === true) {
        return "mic-none-symbolic";
      } else if (v <= 0) {
        return "mic-4-symbolic";
      } else if (v <= 30) {
        return "mic-3-symbolic";
      } else if (v <= 65) {
        return "mic-2-symbolic";
      }

      return "mic-1-symbolic";
    },
  );

  // notify::volume
  defaultSpeaker.get().connect("notify::volume", (s) => {
    setSpeakerVolume(getVolume(s));
  });

  defaultMicrophone.get().connect("notify::volume", (s) => {
    setMicrophoneVolume(getVolume(s));
  });

  // notify::mute
  defaultSpeaker.get().connect("notify::mute", (s) => {
    setSpeakerMuted(s.mute);
  });

  defaultMicrophone.get().connect("notify::mute", (s) => {
    setMicroMuted(s.mute);
  });

  // notify::state
  defaultMicrophone.get().connect("notify::state", (s) => {
    setMicroState(s.state);
  });

  // notify::name
  defaultSpeaker.get().connect("notify::name", (s) => {
    setSpeakerName(getWpName(s));
  });

  defaultMicrophone.get().connect("notify::name", (s) => {
    setMicroName(getWpName(s));
  });

  wp.connect("ready", (s) => {
    setSpeakerName(getWpName(s.get_default_speaker()));
    setMicroName(getWpName(s.get_default_microphone()));
  });

  return (
    <box spacing={spacing.normal}>
      <box
        spacing={spacing.normal}
        $={(s) => {
          const gesture = Gtk.EventControllerScroll.new(
            Gtk.EventControllerScrollFlags.VERTICAL,
          );

          gesture.connect("scroll", (_s, dx, dy) => {
            const instance = defaultSpeaker.get();
            handleVolumeScroll(instance, dx, dy);
          });

          s.add_controller(gesture);
        }}
        tooltipText={speakerName((s) => {
          return s ?? "";
        })}
      >
        <label
          label={speakerVolume((s) => s.toString() + "%")}
          visible={speakerMuted((v) => v === false)}
        />
        <image iconName={speakerIcon} />
      </box>
      <box
        spacing={spacing.normal}
        visible={microState((s) => {
          if (
            s === AstalWp.NodeState.SUSPENDED ||
            s === AstalWp.NodeState.ERROR
          ) {
            return false;
          }

          return true;
        })}
      >
        <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
        <box
          tooltipText={microName((s) => {
            return s ?? "";
          })}
          spacing={spacing.normal}
          $={(s) => {
            const gesture = Gtk.EventControllerScroll.new(
              Gtk.EventControllerScrollFlags.VERTICAL,
            );

            gesture.connect("scroll", (_s, dx, dy) => {
              const instance = defaultMicrophone.get();
              handleVolumeScroll(instance, dx, dy);
            });

            s.add_controller(gesture);
          }}
        >
          <label
            label={microphoneVolume((s) => s.toString() + "%")}
            visible={microMuted((v) => v === false)}
          />
          <image iconName={microIcon} />
        </box>
      </box>
    </box>
  );
};

const NotificationsIcon = ({ isOpened }: { isOpened: Accessor<boolean> }) => {
  const { notifications, dontDisturb } = useNotifications({
    removeOnExpiration: false,
  });

  const hasNotifications = notifications((v) => {
    return v.length > 0;
  });

  const imgClass = createComputed(
    [hasNotifications, isOpened],
    (hasNotifications, isOpened) => {
      if (isOpened === true) return "";
      return hasNotifications === true ? activeClass : "";
    },
  );

  return (
    <box spacing={spacing.normal}>
      {/* <label */}
      {/*   label={notifications((n) => n.length.toString())} */}
      {/*   visible={hasNotifications} */}
      {/* /> */}
      <image
        iconName={dontDisturb((v) =>
          v === true ? "bell-outline-none-symbolic" : "bell-outline-symbolic",
        )}
        class={imgClass}
      />
    </box>
  );
};

const ControlPanel = () => {
  const [isOpened, setIsOpened] = createState(false);
  return (
    <menubutton
      class="ControlPanelMenuButton"
      active={isOpened}
      onNotifyActive={() => {
        setIsOpened((p) => !p);
      }}
    >
      <box spacing={spacing.normal}>
        <NotificationsIcon isOpened={isOpened} />
        <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
        <SoundIcon />
        <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
        <NetworkIcon />
        <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
        <BluetoothIcon />
      </box>

      <ControlPanelPopover />
    </menubutton>
  );
};

export default ControlPanel;
