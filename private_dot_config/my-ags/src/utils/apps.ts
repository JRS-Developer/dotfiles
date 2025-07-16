import Apps from "gi://AstalApps";
import Gio from "gi://Gio";
import GLib from "gi://GLib";

export const createAppsInstance = ({
  variant,
}: {
  variant: "appSearch" | "other";
}) => {
  return new Apps.Apps(
    variant === "appSearch"
      ? undefined
      : {
          nameMultiplier: 2,
          entryMultiplier: 0,
          executableMultiplier: 2,
        },
  );
};

function simplifyAppName(appId: string): string {
  const afterSlash = appId.split("/").pop() ?? appId;
  const afterDot = afterSlash.includes(".")
    ? afterSlash.split(".").pop()!
    : afterSlash;
  let beforeDash = afterDot.includes("-") ? afterDot.split("-")[0] : afterDot;

  beforeDash = beforeDash.replace("_", " ");

  return beforeDash;
}

export const searchAppFromName = (apps: Apps.Apps, name: string) => {
  const nameToUse = simplifyAppName(name);

  const results = apps.fuzzy_query(nameToUse);

  return results;
};

export function getAllCommands() {
  let path = GLib.getenv("PATH");
  if (!path) return [];

  let commands = new Set<string>();

  for (let dirpath of path.split(":")) {
    // Verificar que el directorio existe antes de abrirlo
    if (!GLib.file_test(dirpath, GLib.FileTest.IS_DIR)) continue;

    let dir = GLib.Dir.open(dirpath, 0);
    if (!dir) continue;

    let name;
    while ((name = dir.read_name()) !== null) {
      let full = GLib.build_filenamev([dirpath, name]);
      if (
        GLib.file_test(
          full,
          GLib.FileTest.IS_REGULAR | GLib.FileTest.IS_EXECUTABLE,
        )
      ) {
        commands.add(name);
      }
    }

    dir.close();
  }

  return Array.from(commands).sort();
}

const terminals = [
  "kitty",
  "foot",
  "alacritty",
  "wezterm",
  "gnome-terminal",
  "konsole",
  "xterm",
  "lxterminal",
  "tilix",
  "terminator",
  "urxvt",
] as const;

export function findAvailableTerminal() {
  for (let term of terminals) {
    if (GLib.find_program_in_path(term)) return term;
  }

  return null;
}

function getTerminalCommand(
  terminal: (typeof terminals)[number],
  commandString: string,
) {
  switch (terminal) {
    case "kitty":
    case "foot":
    case "alacritty":
    case "wezterm":
    case "xterm":
    case "urxvt":
    case "terminator":
    case "lxterminal":
      return [terminal, "-e", "bash", "-c", `${commandString}; exec bash`];
    case "gnome-terminal":
    case "tilix":
    case "konsole":
      return [terminal, "--", "bash", "-c", `${commandString}; exec bash`];
    default:
      return null;
  }
}
function isLikelyGuiApp(command: string) {
  const knownGui = new Set([
    "waybar",
    "swaybg",
    "rofi",
    "wofi",
    "dunst",
    "thunar",
    "alacritty",
    "kitty",
    "firefox",
    "code",
    "nautilus",
    "gnome-calculator",
    "pavucontrol",
    "vlc",
    "gimp",
  ]);

  if (knownGui.has(command)) return true;

  // Check if it's in AppInfo
  const appInfo = Gio.AppInfo.get_all().find(
    (app) => app.get_executable() === command,
  );
  if (appInfo) return true;

  // Fallback: check if the binary is linked to GTK/Qt (optional, see below)

  return false;
}

export function runAppCommand(commandString: string) {
  let [ok, argv] = GLib.shell_parse_argv(commandString);
  if (!ok || !argv || argv.length === 0) return;

  let command = argv[0];

  try {
    if (isLikelyGuiApp(command)) {
      Gio.Subprocess.new(argv, Gio.SubprocessFlags.SEARCH_PATH_FROM_ENVP);
    } else {
      let terminal = findAvailableTerminal();
      if (!terminal) throw new Error("No terminal emulator found");

      let termCommand = getTerminalCommand(terminal, commandString);

      if (!termCommand?.length) {
        printerr("No termCommand");
        return;
      }
      Gio.Subprocess.new(
        termCommand,
        Gio.SubprocessFlags.SEARCH_PATH_FROM_ENVP,
      );
    }
  } catch (e) {
    logError(e);
  }
}
