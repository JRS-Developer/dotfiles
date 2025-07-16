import { createComputed, For } from "ags";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationListItem from "./NotificationListItem";
import { spacing } from "../../constants/theme/spacing";
import { Gtk } from "ags/gtk4";

const NotificationsPopover = () => {
  const { notifications, dontDisturb } = useNotifications({
    removeOnResolved: true,
  });
  const hasNotifications = notifications((v) => v.length > 0);

  const iconName = createComputed([dontDisturb], (dontDisturb) => {
    if (dontDisturb === true) {
      return "bell-outline-none-symbolic";
    }
    return "bell-outline-symbolic";
  });

  const className = createComputed(
    [dontDisturb, hasNotifications],
    (dontDisturb, hasNotifications) => {
      if (dontDisturb === true || hasNotifications === false) {
        return "flat";
      }

      return "flat destructive-action";
    },
  );

  return (
    <menubutton iconName={iconName} class={className}>
      <popover widthRequest={300} heightRequest={500}>
        <box
          spacing={spacing.large}
          orientation={Gtk.Orientation.VERTICAL}
          vexpand
        >
          <label label="Notificaciones" class="title-3" xalign={0} />
          <For each={notifications}>
            {(item) => <NotificationListItem item={item} />}
          </For>

          <box
            visible={notifications((v) => v.length === 0)}
            orientation={Gtk.Orientation.VERTICAL}
            hexpand
            vexpand
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
          >
            <label
              class="title-4"
              label="Sin Notificaciones"
              valign={Gtk.Align.CENTER}
            />
          </box>
        </box>
      </popover>
    </menubutton>
  );
};

export default NotificationsPopover;
