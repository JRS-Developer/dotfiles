import { createBinding, createComputed, For } from "ags";
import { Gtk } from "ags/gtk4";
import Notifd from "gi://AstalNotifd";
import Pango from "gi://Pango?version=1.0";
import { spacing } from "../../constants/theme/spacing";
import CircularImage from "../CircularImage";

const NotificationListItem = ({ item }: { item: Notifd.Notification }) => {
  const appIcon = createBinding(item, "appIcon");
  const desktopEntry = createBinding(item, "desktopEntry");
  const summary = createBinding(item, "summary");
  const body = createBinding(item, "body");
  const actions = createBinding(item, "actions");

  const mainIcon = createComputed([appIcon, desktopEntry], (a, d) => a || d);

  const firstAction = actions((v) => v?.[0]);
  const otherActions = actions((v) => v?.splice(1));

  return (
    <box
      spacing={spacing.normal}
      class="NotificationWindowNotificationItem"
      hexpand
      orientation={Gtk.Orientation.VERTICAL}
    >
      <box spacing={spacing.normal}>
        <CircularImage
          visible={mainIcon((a) => {
            return !!a;
          })}
          img={mainIcon}
          iconFallback="notification-active"
          size={300}
          heightRequest={60}
          widthRequest={60}
        />

        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.START}
          hexpand
        >
          <box spacing={spacing.small}>
            <label
              hexpand
              visible={summary((s) => !!s)}
              label={summary}
              class="NotificationWindowNotificationItemSummary"
              wrap
              ellipsize={Pango.EllipsizeMode.END}
              widthChars={30}
              xalign={0}
              maxWidthChars={30}
              lines={1}
              halign={Gtk.Align.START}
            />

            <button
              iconName="dialog-close"
              class="circular"
              onClicked={() => {
                item.dismiss();
              }}
            />
          </box>

          <label
            label={item.body}
            visible={body((s) => !!s)}
            wrap
            ellipsize={Pango.EllipsizeMode.END}
            widthChars={30}
            maxWidthChars={30}
            halign={Gtk.Align.START}
            xalign={0}
            lines={2}
          />
        </box>
      </box>

      <box visible={otherActions((a) => a.length > 0)} spacing={spacing.normal}>
        <For each={otherActions}>
          {(action) => {
            return (
              <button hexpand onClicked={() => item.invoke(action.id)}>
                <label label={action.label} halign={Gtk.Align.CENTER} hexpand />
              </button>
            );
          }}
        </For>
      </box>
    </box>
  );
};

export default NotificationListItem;
