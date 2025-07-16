import { Accessor, createBinding, createComputed, createState, For } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import Hyprland from "gi://AstalHyprland";
import { getIsCurrentMonitor } from "../../utils/is-current-monitor";
import { spacing } from "../../constants/theme/spacing";
import { windowNames } from "../../constants/windows";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationListItem from "./NotificationListItem";
import Notifd from "gi://AstalNotifd";

const wantedWidth = 400;

// const NotificationWindow = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
//   const { TOP, RIGHT } = Astal.WindowAnchor;
//   const { notifications } = useNotifications({ removeOnResolved: true });
//
//   const hyprland = Hyprland.get_default();
//
//   const focusedMonitor = createBinding(hyprland, "focusedMonitor");
//
//   const isVisible = createComputed(
//     [focusedMonitor, notifications],
//     (m, notifications) => {
//       return getIsCurrentMonitor(m, gdkmonitor) && notifications.length > 0;
//     },
//   );
//
//   return (
//     <window
//       visible={isVisible}
//       name={windowNames.NotificationWindow}
//       class="NotificationWindow"
//       gdkmonitor={gdkmonitor}
//       exclusivity={Astal.Exclusivity.NORMAL}
//       anchor={TOP | RIGHT}
//       application={app}
//     >
//       <box
//         orientation={Gtk.Orientation.VERTICAL}
//         spacing={spacing.normal}
//         widthRequest={wantedWidth}
//       >
//         <For each={notifications}>
//           {(item) => <NotificationListItem item={item} />}
//         </For>
//       </box>
//     </window>
//   );
// };

const NotificationWindow = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  const { TOP, RIGHT } = Astal.WindowAnchor;

  const [notifications, setNotifications] = createState<{ id: number }[]>([]);

  const notifd = Notifd.get_default();

  const hyprland = Hyprland.get_default();

  const focusedMonitor = createBinding(hyprland, "focusedMonitor");

  const isVisible = createComputed(
    [focusedMonitor, notifications],
    (m, notifications) => {
      return getIsCurrentMonitor(m, gdkmonitor) && notifications.length > 0;
    },
  );
  notifd.connect("notified", (_source, id, replaced) => {
    const notif = notifd.get_notification(id);

    if (!notif) return;

    setNotifications((prev) => {
      if (replaced) {
        // 🔄 Update the existing notification
        return prev.map((item) => (item.id === id ? notif : item));
      }

      // 🆕 New notification
      return [notif, ...prev];
    });
  });

  notifd.connect("notify::notifications", () => {
    const instance = Notifd.get_default();
    console.log(instance.get_notifications().length);
  });

  notifd.connect("resolved", (_source, id, _reason) => {
    setNotifications((prev) => {
      return prev.filter((n) => n.id !== id);
    });
  });

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
          {(item) => <label label={item.id.toString()} />}
        </For>
      </box>
    </window>
  );
};

export default NotificationWindow;
