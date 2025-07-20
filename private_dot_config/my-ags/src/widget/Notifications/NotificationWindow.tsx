import { Accessor, createBinding, createComputed, For } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import Hyprland from "gi://AstalHyprland";
import { getIsCurrentMonitor } from "../../utils/is-current-monitor";
import { spacing } from "../../constants/theme/spacing";
import { windowNames } from "../../constants/windows";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationListItem from "./NotificationListItem";

const wantedWidth = 400;

const NotificationWindow = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  const { TOP, RIGHT } = Astal.WindowAnchor;
  const { notifications } = useNotifications({ removeOnExpiration: true });

  const hyprland = Hyprland.get_default();

  const focusedMonitor = createBinding(hyprland, "focusedMonitor");

  const isVisible = createComputed(
    [focusedMonitor, notifications],
    (m, notifications) => {
      return getIsCurrentMonitor(m, gdkmonitor) && notifications.length > 0;
    },
  );

  return (
    <window
      visible={isVisible}
      name={windowNames.NotificationWindow}
      class="NotificationWindow"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | RIGHT}
      application={app}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={spacing.normal}
        widthRequest={wantedWidth}
      >
        <For each={notifications}>
          {(item) => <NotificationListItem item={item} />}
        </For>
      </box>
    </window>
  );
};

export default NotificationWindow;
