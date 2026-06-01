import { createBinding, createState } from "ags";
import Notifd from "gi://AstalNotifd";
import GLib from "gi://GLib";

export const useNotifications = ({
  variant,
}: {
  variant: "save-forever" | "temporal";
}) => {
  const [notifications, setNotifications] = createState<Notifd.Notification[]>(
    [],
  );

  const notifd = Notifd.get_default();
  const ignoreTimeout = createBinding(notifd, "ignoreTimeout");
  const dontDisturb = createBinding(notifd, "dontDisturb");

  const toggleDontDisturb = () => {
    const v: boolean = notifd.dont_disturb;
    notifd.set_dont_disturb(!v);
  };

  const removeNotificationById = (id: number) => {
    setNotifications((prev) => {
      return prev.filter((n) => n.get_id() !== id);
    });
  };

  const clearNotifications = () => {
    notifd.get_notifications().forEach((n) => n.dismiss());
  };

  notifd.connect("notified", (_source, id, replaced) => {
    const instance = Notifd.get_default();
    const notif = instance.get_notification(id);

    if (notifd.get_dont_disturb() === true && variant === "temporal") return;
    if (!notif) return;

    setNotifications((prev) => {
      if (replaced) {
        // 🔄 Update the existing notification
        return prev.map((item) => (item.id === id ? notif : item));
      }

      // 🆕 New notification
      return [notif, ...prev];
    });

    if (variant === "temporal" && notif.get_expire_timeout() === -1) {
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 30_000, () => {
        removeNotificationById(id);
        return GLib.SOURCE_REMOVE; // don't repeat
      });
    }
  });

  notifd.connect("resolved", (_source, id, reason) => {
    if (variant === "save-forever" && reason === Notifd.ClosedReason.EXPIRED)
      return;

    removeNotificationById(id);
  });

  return {
    notifications,
    dontDisturb,
    ignoreTimeout,
    clearNotifications,
    toggleDontDisturb,
  };
};
