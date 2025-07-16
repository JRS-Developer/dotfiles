import Gio from "gi://Gio";
import GLib from "gi://GLib";

function extractFrame(videoPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    const cmd = [
      "ffmpeg",
      "-y", // overwrite output
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      outputPath,
    ];

    const proc = Gio.Subprocess.new(
      cmd,
      Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE,
    );

    proc.wait_check_async(null, (procObj, res) => {
      try {
        const success = procObj?.wait_check_finish(res);
        if (success) resolve(true);
        else reject(new Error("ffmpeg failed"));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// New: Listen for mpv 'path' changes via IPC and extract frame on each update
async function listenMpvPathChanges(
  onFrameExtracted: (framePath: string) => void,
  retry = true,
) {
  const address = Gio.UnixSocketAddress.new("/tmp/mpvsocket");
  const client = new Gio.SocketClient();

  let conn: Gio.IOStream;

  try {
    conn = await new Promise<Gio.IOStream>((resolve, reject) => {
      client.connect_async(address, null, (src, res) => {
        try {
          resolve(client.connect_finish(res));
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (err) {
    printerr("Connection failed:", (err as { message: string }).message);
    if (retry) {
      GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3, () => {
        listenMpvPathChanges(onFrameExtracted, true);
        return GLib.SOURCE_REMOVE;
      });
    }
    return;
  }

  const input = conn.get_input_stream();
  const output = conn.get_output_stream();

  // Subscribe
  const subscribeCmd =
    JSON.stringify({
      command: ["observe_property", 1, "path"],
    }) + "\n";

  try {
    output.write_all(subscribeCmd, null);
  } catch (e) {
    printerr("Write failed:", (e as { message: string }).message);
    if (retry) {
      GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3, () => {
        listenMpvPathChanges(onFrameExtracted, true);
        return GLib.SOURCE_REMOVE;
      });
    }
    return;
  }

  let buffer = "";

  function onRead(src: Gio.InputStream | null, res: Gio.AsyncResult) {
    if (!src) return;

    try {
      const bytes = src.read_bytes_finish(res);
      const data = bytes?.get_data();

      if (!data || data.length === 0) {
        printerr("Disconnected or EOF. Reconnecting...");
        conn.close(null); // cleanup
        if (retry) {
          GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3, () => {
            listenMpvPathChanges(onFrameExtracted, true);
            return GLib.SOURCE_REMOVE;
          });
        }
        return;
      }

      buffer += new TextDecoder().decode(data);

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (
            json.event === "property-change" &&
            json.name === "path" &&
            json.data
          ) {
            const outputPath = GLib.build_filenamev([
              "/tmp",
              `mpv_current_frame-${Date.now()}.jpg`,
            ]);

            extractFrame(json.data, outputPath)
              .then(() => {
                onFrameExtracted(outputPath);
              })
              .catch((e) => {
                printerr("Frame extraction error:", e.message);
              });
          }
        } catch (e) {
          printerr("JSON parse error:", (e as { message: string }).message);
        }
      }

      // Keep reading
      src.read_bytes_async(4096, GLib.PRIORITY_DEFAULT, null, onRead);
    } catch (e) {
      printerr("Stream read error:", (e as { message: string }).message);
    }
  }

  input.read_bytes_async(4096, GLib.PRIORITY_DEFAULT, null, onRead);
}

// Export a function to start the listener
export function startMpvImageListener(
  onFrameExtracted: (framePath: string) => void,
) {
  listenMpvPathChanges(onFrameExtracted);
}
