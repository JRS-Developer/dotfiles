import Gio from "gi://Gio";
import GLib from "gi://GLib";

function sendMpvCommand(command: string[]) {
  return new Promise<void>((resolve, reject) => {
    const address = Gio.UnixSocketAddress.new("/tmp/mpvsocket");
    const client = new Gio.SocketClient();

    client.connect_async(address, null, (client_, res) => {
      try {
        if (!client_) {
          printerr("No client_ for sendMpvCommand");
          return;
        }

        const conn = client_.connect_finish(res);
        const output = conn.get_output_stream();

        const cmdStr = JSON.stringify({ command }) + "\n";
        const byteArray = new TextEncoder().encode(cmdStr); // ✅ Convert to Uint8Array

        output.write_bytes_async(
          byteArray,
          GLib.PRIORITY_DEFAULT,
          null,
          (stream, result) => {
            try {
              stream?.write_bytes_finish(result);
              output.close(null);
              conn.close(null);
              resolve();
            } catch (e) {
              const error = e as { message: string };
              reject(
                new Error("Failed to write to MPV socket: " + error.message),
              );
            }
          },
        );
      } catch (e) {
        const error = e as { message: string };
        reject(new Error("Failed to connect to MPV socket: " + error.message));
      }
    });
  });
}

export const changeMpvPaperImage = (action: "next" | "prev") => {
  if (action === "next") {
    sendMpvCommand(["playlist-next"]);
  } else {
    sendMpvCommand(["playlist-prev"]);
  }
};
