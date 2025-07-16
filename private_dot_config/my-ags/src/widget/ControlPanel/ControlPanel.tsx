import { createBinding, createComputed, createState } from "ags";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalNetwork from "gi://AstalNetwork";
import { spacing } from "../../constants/theme/spacing";
import { getHasVpn } from "../../utils/network";
import { Gtk } from "ags/gtk4";

const BluetoothIcon = () => {
  const bluetooth = AstalBluetooth.get_default();
  const isConnectedBluetooth = createBinding(bluetooth, "is_connected");
  const isPoweredBluetooth = createBinding(bluetooth, "is_powered");
  const bluetoothAdapter = createBinding(bluetooth, "adapter");

  const iconName = createComputed(
    [isConnectedBluetooth, isPoweredBluetooth, bluetoothAdapter],
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

  return (
    <image
      iconName={iconName}
      class={isConnectedBluetooth((v) =>
        v ? "ControlPanelBluetoothActive" : "",
      )}
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

  return (
    <box spacing={spacing.small}>
      {/* <label label={primary((p) => p.toString())} /> */}
      {/* <label label={connectivity((p) => p.toString())} /> */}
      {/* <label label={state((p) => p.toString())} /> */}
      <image iconName={iconName} />
      <image iconName={"vpn-caps-symbolic"} visible={hasVpn} />
    </box>
  );
};

const ControlPanel = () => {
  return (
    <menubutton>
      <box spacing={spacing.normal}>
        <NetworkIcon />
        <Gtk.Separator orientation={Gtk.Orientation.VERTICAL} />
        <BluetoothIcon />
      </box>

      <popover>Hello</popover>
    </menubutton>
  );
};

export default ControlPanel;
