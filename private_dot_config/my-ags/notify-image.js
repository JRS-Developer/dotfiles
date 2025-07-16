import Notify from "gi://Notify";
import GdkPixbuf from "gi://GdkPixbuf";
import System from "system";

Notify.init("ShellNotify");

const imagePath = ARGV[0]; // passed from shell

try {
  const pixbuf = GdkPixbuf.Pixbuf.new_from_file(imagePath);

  const notif = new Notify.Notification({
    summary: "Image Notification",
    body: "Here's your custom image!",
  });

  notif.set_image_from_pixbuf(pixbuf);
  notif.show();
} catch (e) {
  print(`Failed to load image: ${e.message}`);
  System.exit(1);
}
