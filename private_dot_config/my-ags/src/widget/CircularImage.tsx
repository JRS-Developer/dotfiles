import { Accessor, onCleanup } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import GdkPixbuf from "gi://GdkPixbuf";
import { getIsIcon } from "../utils/icons";

const getPixbufForIconName = ({
  icon,
  size,
}: {
  icon: string;
  size: number;
}) => {
  const display = Gdk.Display.get_default();
  if (!display) return null;

  const iconTheme = Gtk.IconTheme.get_for_display(display);

  if (!getIsIcon({ icon, iconTheme })) {
    return null;
  }

  const iconInfo = iconTheme.lookup_icon(
    icon,
    null, // fallbacks
    200, // size in app pixels
    1, // scale (for HiDPI, usually 1 or window scale)
    null, // text direction, null for LTR
    null, // flags);
  );
  const file = iconInfo?.get_file();
  const path = file?.get_path();

  if (!path) return null;

  try {
    return GdkPixbuf.Pixbuf.new_from_file_at_scale(path, size, size, true);
  } catch (error) {
    return null;
  }
};

const CircularImage = ({
  img,
  size: wantedSize,
  $type,
  iconFallback,
  onClicked,
  onRightClicked,
  ...props
}: {
  img: Accessor<string>;
  visible?: Accessor<boolean>;
  size: number;
  $type?: string;
  iconFallback: string | null;
  onClicked?: () => void;
  onRightClicked?: () => void;
} & Partial<
  Pick<
    Gtk.DrawingArea,
    "widthRequest" | "heightRequest" | "hexpand" | "vexpand"
  >
>) => {
  let drawinArea: Gtk.DrawingArea;

  const unsubscribe = img.subscribe(() => {
    drawinArea.queue_draw();
  });

  onCleanup(() => {
    unsubscribe();
  });

  return (
    <Gtk.DrawingArea
      $type={$type}
      {...props}
      $={(s) => {
        s.set_draw_func((_, cr, width, height) => {
          let cover = img.get();

          cover = cover?.startsWith("file://")
            ? cover.replace("file://", "")
            : cover;

          const size = Math.min(width, height, wantedSize);

          let pixbuf: GdkPixbuf.Pixbuf | null = null;

          if (cover) {
            // load the cover image, scaled square
            try {
              const origPixbuf = GdkPixbuf.Pixbuf.new_from_file(cover);

              const imgWidth = origPixbuf.get_width();
              const imgHeight = origPixbuf.get_height();
              const circleDiameter = size;

              const scaleX = circleDiameter / imgWidth;
              const scaleY = circleDiameter / imgHeight;
              const scale = Math.max(scaleX, scaleY);

              const scaledWidth = Math.ceil(imgWidth * scale);
              const scaledHeight = Math.ceil(imgHeight * scale);

              pixbuf = origPixbuf.scale_simple(
                scaledWidth,
                scaledHeight,
                GdkPixbuf.InterpType.HYPER,
              );
            } catch {
              pixbuf = getPixbufForIconName({ icon: cover, size });
            }
          }

          if (!pixbuf && iconFallback) {
            pixbuf = getPixbufForIconName({
              icon: iconFallback,
              size,
            });
          }

          if (!pixbuf) {
            return;
          }

          const cx = width / 2;
          const cy = height / 2;
          const radius = size / 2;

          cr.arc(cx, cy, radius, 0, Math.PI * 2);
          cr.clip();

          const x = cx - pixbuf.get_width() / 2;
          const y = cy - pixbuf.get_height() / 2;

          Gdk.cairo_set_source_pixbuf(cr, pixbuf, x, y);
          cr.paint();
        });

        if (onClicked) {
          const gesture = Gtk.GestureClick.new();

          gesture.set_button(1);

          gesture.connect("released", () => {
            onClicked();
          });

          s.add_controller(gesture);
        }

        if (onRightClicked) {
          const gesture = Gtk.GestureClick.new();

          gesture.set_button(3);

          gesture.connect("released", () => {
            onRightClicked();
          });

          s.add_controller(gesture);
        }

        drawinArea = s;
      }}
    />
  );
};

export default CircularImage;
