import app from "ags/gtk4/app";
import { createState, Accessor, Setter } from "ags";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { exec, execAsync } from "ags/process";
import { createPoll } from "ags/time";
import GLib from "gi://GLib";
import MediaPlayer from "./MediaPlayer";
import { useIsAnyPlayerPlaying } from "../hooks/useIsAnyPlayerPlaying";
import { startMpvImageListener } from "../utils/get-mpvpaper-image";
import CircularImage from "./CircularImage";
import { changeMpvPaperImage } from "../utils/change-mpvpaper-image";
import { spacing } from "../constants/theme/spacing";
import { useCpuUsage } from "../hooks/useCpuUsage";
import { useMemoryRamUsage } from "../hooks/useMemoryRamUsage";
import { useFormattedTime } from "../hooks/useFormattedTime";
import Workspaces from "./Workspaces";
import Tray from "./Tray";
import { windowNames } from "../constants/windows";
import { formatKeyboard, getKeyboard } from "../utils/keyboard";
import { findAvailableTerminal } from "../utils/apps";
import ControlPanel from "./ControlPanel/ControlPanel";
import { LogoutPanelWindowContext } from "../context/LogoutPanelWindowContext";
import WindowOutsideRadius from "./WindowOutsideRadius";

const dashboardBoxSpacing = spacing.normal;

const getDistro = () => {
  try {
    const [ok, content] = GLib.file_get_contents("/etc/os-release");
    if (!ok) return "Unknown";

    const text = new TextDecoder().decode(content);
    const match = text.match(/^PRETTY_NAME="(.+)"$/m);
    return match ? match[1] : "Unknown";
  } catch {
    return "Unknown";
  }
};

const WallpaperImg = () => {
  const [wallpaperImg, setWallpaperImg] = createState("");

  startMpvImageListener((frame) => {
    setWallpaperImg(frame);
  });

  return (
    <overlay>
      <box
        class="WallpaperImgButtonContainer"
        $type="overlay"
        widthRequest={102}
        heightRequest={100}
      >
        <button
          class="circular flat WallpaperImgButton"
          hexpand
          vexpand
          iconName="view-refresh"
          onClicked={() => {
            changeMpvPaperImage("next");
          }}
          $={(s) => {
            const gesture = Gtk.GestureClick.new();

            gesture.set_button(3);

            gesture.connect("released", () => {
              changeMpvPaperImage("prev");
            });

            s.add_controller(gesture);
          }}
        />
      </box>

      <CircularImage
        img={wallpaperImg}
        size={300}
        widthRequest={100}
        heightRequest={100}
        iconFallback="user-identity"
      />
    </overlay>
  );
};

const SystemProgressBarStat = ({
  iconName,
  fraction,
}: {
  iconName: string;
  fraction: Accessor<number>;
}) => {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={spacing.normal}>
      <Gtk.LevelBar
        orientation={Gtk.Orientation.VERTICAL}
        vexpand
        value={fraction}
        maxValue={1}
        minValue={0}
        inverted
      />
      <image iconName={iconName} />
    </box>
  );
};

const DashboardTab = () => {
  const wm =
    GLib.getenv("XDG_SESSION_DESKTOP") ??
    GLib.getenv("XDG_CURRENT_DESKTOP") ??
    "Unknown";

  const timeString = useFormattedTime("time");

  const separatedTime = timeString((v) => {
    const [hour, minute] = v.split(":");
    return { hour: hour || "", minute: minute || "" };
  });

  const dateString = createPoll("", 1000, () => {
    const now = GLib.DateTime.new_now_local();
    const dayString = now.format("%a, %e");

    if (!dayString) return "";

    // Capitalize first letter
    const capitalized =
      dayString?.charAt(0).toUpperCase() + dayString?.slice(1);
    return capitalized;
  });

  const distro = getDistro();
  const upTime = createPoll("time", 60000, "uptime -p");

  const cpuUsage = useCpuUsage();
  const memoryUsage = useMemoryRamUsage();

  return (
    <box
      orientation={Gtk.Orientation.HORIZONTAL}
      spacing={dashboardBoxSpacing}
      class="DashboardTab"
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={dashboardBoxSpacing}
        hexpand
      >
        <box spacing={spacing.normal} hexpand class="DashboardBox extraPadding">
          <WallpaperImg />

          <box
            orientation={Gtk.Orientation.VERTICAL}
            valign={Gtk.Align.CENTER}
            spacing={spacing.small}
          >
            <box spacing={spacing.normal}>
              <image iconName="hyprland-symbolic" class="HyprLandIcon" />
              <label label={wm} class="DashboardTabSysInfoLabel" />
            </box>
            <box spacing={spacing.normal}>
              <image iconName="endeavouros-symbolic" class="EndeavourOsIcon" />
              <label label={distro} class="DashboardTabSysInfoLabel" />
            </box>

            <box spacing={spacing.normal}>
              <image iconName="clock-alt-symbolic" class="UptimeIcon" />
              <label label={upTime} class="DashboardTabSysInfoLabel" />
            </box>
          </box>
        </box>

        <box spacing={dashboardBoxSpacing} hexpand>
          <box class="DashboardBox extraPadding" vexpand hexpand>
            <box
              halign={Gtk.Align.CENTER}
              valign={Gtk.Align.CENTER}
              orientation={Gtk.Orientation.VERTICAL}
              hexpand
            >
              <box orientation={Gtk.Orientation.VERTICAL}>
                <label
                  label={separatedTime((s) => s.hour)}
                  class="DashboardTabHourAndMinute"
                />

                <Gtk.Separator />

                <label
                  label={separatedTime((s) => s.minute)}
                  class="DashboardTabHourAndMinute"
                />
              </box>

              <label label={dateString} class="DashboardTabDate" />
            </box>
          </box>
          <box class="DashboardBox">
            <Gtk.Calendar show_heading={false} />
          </box>

          <box class="DashboardBox" spacing={spacing.large}>
            <SystemProgressBarStat
              iconName="processor-symbolic"
              fraction={cpuUsage((c) => c.cpuUsageInFraction)}
            />

            <SystemProgressBarStat
              iconName="memory-symbolic"
              fraction={memoryUsage((c) => c.memoryUsageInFraction)}
            />
          </box>
        </box>
      </box>

      <box class="DashboardBox" widthRequest={300}>
        <box valign={Gtk.Align.CENTER} hexpand vexpand>
          <MediaPlayer variant="minimal" />
        </box>
      </box>
    </box>
  );
};

const MediaTab = () => {
  return (
    <box class="DashboardTab">
      <MediaPlayer variant={"complete"} />
    </box>
  );
};

const DashboardPopover = () => {
  let switcher: Gtk.StackSwitcher | undefined;
  let stack: Gtk.Stack | undefined;

  return (
    <popover>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <Gtk.StackSwitcher
          $={(s) => {
            switcher = s;
          }}
          stack={stack}
        />
        <Gtk.Stack
          transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
          $={(s) => {
            stack = s;
            if (switcher) switcher.set_stack(s);
          }}
        >
          <Gtk.StackPage
            name="child1"
            title="Dashboard"
            // @ts-expect-error it works anyways
            child={<DashboardTab />}
          />
          <Gtk.StackPage
            name="child2"
            title="Media"
            // @ts-expect-error it works anyways
            child={<MediaTab />}
          />
        </Gtk.Stack>
      </box>
    </popover>
  );
};

const DashboardButton = () => {
  const isAnyPlaying = useIsAnyPlayerPlaying();
  return (
    <menubutton>
      <box spacing={spacing.normal}>
        <label label="Dashboard" />
        <image
          iconName={isAnyPlaying((playing) =>
            playing ? "audio-on" : "user-home",
          )}
        />
      </box>

      <DashboardPopover />
    </menubutton>
  );
};

const TimeRow = () => {
  const timeString = useFormattedTime("time-with-pm");

  return (
    <menubutton halign={Gtk.Align.CENTER}>
      <box spacing={spacing.normal}>
        <image iconName="month-symbolic" />
        <label label={timeString} />
      </box>
      <popover>
        <Gtk.Calendar />
      </popover>
    </menubutton>
  );
};

const MainBar = ({
  visible,
  index,
  gdkmonitor,
  keyboard,
  setKeyboard,
}: {
  visible: Accessor<boolean>;
  index: number;
  gdkmonitor: Gdk.Monitor;

  keyboard: Accessor<string>;
  setKeyboard: Setter<string>;
}) => {
  const { setVisible: setVisibleLogout } = LogoutPanelWindowContext.use();

  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible={visible}
      name={windowNames.Bar}
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <WindowOutsideRadius windowPosition="top">
        <centerbox cssName="centerbox" hexpand>
          <box $type="start">
            <Workspaces gdkmonitor={gdkmonitor} index={index} />
          </box>

          <box $type="center">
            <DashboardButton />
          </box>

          <box $type="end" spacing={spacing.large}>
            <Tray />

            <box spacing={spacing.small}>
              <button
                class="flat"
                onClicked={async () => {
                  try {
                    await execAsync("hyprctl switchxkblayout current next");
                    setKeyboard(getKeyboard());
                  } catch (error) {
                    printerr(error);
                  }
                }}
                tooltipText="Cambiar Teclado"
              >
                <label label={keyboard((v) => formatKeyboard(v))} />
              </button>

              <button
                iconName="image-round-symbolic"
                class="flat"
                onClicked={() => {
                  changeMpvPaperImage("next");
                }}
                $={(s) => {
                  const gesture = Gtk.GestureClick.new();

                  gesture.set_button(3);

                  gesture.connect("released", () => {
                    changeMpvPaperImage("prev");
                  });

                  s.add_controller(gesture);
                }}
                tooltipText="Cambiar fondo de pantalla"
              />
              <button
                iconName="color-picker-symbolic"
                class="flat"
                onClicked={() => {
                  execAsync(
                    "hyprpicker -a", // -a para copiar al portapapeles automáticamente
                  );
                }}
                tooltipText="Haz clic para elegir un color"
              />
              <button
                iconName="clipboard-symbolic"
                class="flat"
                onClicked={() => {
                  const terminal = findAvailableTerminal();

                  if (!terminal) {
                    printerr("NO terminal");
                    return;
                  }

                  exec([terminal, "--class", "clipse", "-e", "clipse"]);
                }}
                tooltipText="Clipboard"
              />

              {/* <NotificationsPopover /> */}
            </box>

            <TimeRow />

            <ControlPanel />

            <button
              iconName="system-shutdown"
              class="destructive-action circular"
              onClicked={() => {
                setVisibleLogout?.(true);
              }}
            />
          </box>
        </centerbox>
      </WindowOutsideRadius>
    </window>
  );
};

export default function Bar({
  gdkmonitor,
  index,
  keyboard,
  setKeyboard,
  visible,
}: {
  gdkmonitor: Gdk.Monitor;
  index: number;
  keyboard: Accessor<string>;
  setKeyboard: Setter<string>;
  visible: Accessor<boolean>;
}) {
  return (
    <MainBar
      visible={visible}
      index={index}
      keyboard={keyboard}
      setKeyboard={setKeyboard}
      gdkmonitor={gdkmonitor}
    />
  );
}
