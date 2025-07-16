import { createBinding, createState } from "ags";
import Notifd from "gi://AstalNotifd";

export const useNotifications = ({
  removeOnResolved,
}: {
  removeOnResolved: boolean;
}) => {
  const [notifications, setNotifications] = createState<Notifd.Notification[]>(
    [],
  );

  const notifd = Notifd.get_default();
  const ignoreTimeout = createBinding(notifd, "ignoreTimeout");
  const dontDisturb = createBinding(notifd, "dontDisturb");

  notifd.connect("notified", (_source, id, replaced) => {
    const instance = Notifd.get_default();
    const notif = instance.get_notification(id);
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

  notifd.connect("resolved", (_source, id, _reason) => {
    if (removeOnResolved) {
      setNotifications((prev) => {
        return prev.filter((n) => n.get_id() !== id);
      });
    }
  });

  return { notifications, dontDisturb, ignoreTimeout };
};
