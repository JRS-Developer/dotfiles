import app from "ags/gtk4/app";
import { createState, For, With, createBinding, createComputed } from "ags";
import { Astal, Gtk, Gdk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { createPoll } from "ags/time";
import Hyprland from "gi://AstalHyprland";
import Tray from "gi://AstalTray";
import Mpris from "gi://AstalMpris";

const getWorkspaces = (
  hyprland: Hyprland.Hyprland,
  gdkmonitor: Gdk.Monitor,
): Hyprland.Workspace[] => {
  return [
    ...hyprland
      .get_workspaces()
      .filter((w) => w?.get_monitor()?.get_model() === gdkmonitor.get_model()),
  ].sort((a, b) => a.get_id() - b.get_id());
};

const getIsValidKeyForScale = (keyval: number): boolean => {
  return [
    Gdk.KEY_Right,
    Gdk.KEY_Left,
    Gdk.KEY_Page_Down,
    Gdk.KEY_Page_Up,
    Gdk.KEY_Home,
    Gdk.KEY_End,
  ].includes(keyval);
};

const formatSeconds = (seconds: number) => {
  const totalSeconds = Math.floor(seconds); // asegurar entero
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const getIsLastPlayer = (p: Mpris.Player) => {
  return p.get_bus_name().includes("playerctld");
};

const getLastPlayer = (players: Mpris.Player[]) => {
  return players.find((p) => getIsLastPlayer(p));
};

const Workspaces = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  const hyprland = Hyprland.get_default();
  const [focusedWorkspace, setFocusedWorkspace] = createState(
    hyprland.get_focused_workspace().id,
  );
  const [workspaces, setWorkspaces] = createState(
    getWorkspaces(hyprland, gdkmonitor),
  );

  // Update the label when the workspace changes
  hyprland.connect("notify::focused-workspace", () => {
    const id: number = hyprland.get_focused_workspace().id;
    setFocusedWorkspace(id);
  });

  hyprland.connect("notify::workspaces", () => {
    const newWorkspaces = getWorkspaces(hyprland, gdkmonitor);

    setWorkspaces(newWorkspaces);
  });

  return (
    <For each={workspaces}>
      {(item) => (
        <box>
          <With value={focusedWorkspace}>
            {(focused) => {
              const workspaceId = item.get_id();

              let label = workspaceId === focused ? "1" : "0";

              if (item.get_clients().length === 0) {
                label = label + "(empty)";
              }

              return <label label={label} />;
            }}
          </With>
        </box>
      )}
    </For>
  );
};

const TrayRow = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  const tray = Tray.get_default();
  const items = createBinding(tray, "items");
  return (
    <box>
      <For each={items}>
        {(item) => {
          const hasItems: boolean = !!(item
            .get_menu_model()
            ?.get_n_items() satisfies number | undefined);

          const tooltipMarkup = item.get_tooltip_markup() || item.get_title();
          if (hasItems)
            return (
              <menubutton
                class={"unstyledMenuButton"}
                $={(s) => {
                  // pass actions so it can work
                  const actions = item.get_action_group();
                  // dbusmenu is needed, it makes it work, it was in the docs
                  if (actions) s.insert_action_group("dbusmenu", actions);
                }}
                // generally they don't have tooltip_markup but just in case
                tooltip_markup={tooltipMarkup}
                menuModel={item.menuModel}
              >
                <image gicon={item.get_gicon()} />
              </menubutton>
            );

          return (
            <button
              css={"all:unset;"}
              onClicked={() => {
                item.activate(0, 0);
              }}
              tooltip_markup={tooltipMarkup}
            >
              <image gicon={item.get_gicon()} />
            </button>
          );
        }}
      </For>
    </box>
  );
};

const MprisRow = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  const mpris = Mpris.get_default();
  const defaultPlayers = mpris.get_players();
  const defaultLastPlayer = getLastPlayer(defaultPlayers);

  const players = createBinding(mpris, "players");
  // we don't use defaultLastPlayer because setLastPlayer doesn't update it due to reference or similar, idk
  const [lastPlayer, setLastPlayer] = createState(
    defaultLastPlayer
      ? {
          title: defaultLastPlayer.get_title(),
          playbackStatus: defaultLastPlayer.get_playback_status(),
          artist: defaultLastPlayer.get_artist(),
          canNext: defaultLastPlayer.get_can_go_next(),
          canBack: defaultLastPlayer.get_can_go_previous(),
          canPlayOrPause: defaultLastPlayer.get_can_control(),
          coverArt: defaultLastPlayer.get_cover_art(),
          position: defaultLastPlayer.get_position(),
          length: defaultLastPlayer.get_length(),
          volume: defaultLastPlayer.get_volume(),
        }
      : null,
  );
  const [seekValue, setSeekValue] = createState<number | null>(null);
  let playerMenuButton: Gtk.MenuButton;
  let playerPopover: Gtk.Popover;

  players.get().forEach((player) => {
    player.connect("notify", (changed) => {
      const isCurrent = getIsLastPlayer(changed);

      if (isCurrent === false) return;

      setLastPlayer({
        title: changed.get_title(),
        playbackStatus: changed.get_playback_status(),
        artist: changed.get_artist(),
        canNext: changed.get_can_go_next(),
        canBack: changed.get_can_go_previous(),
        canPlayOrPause: changed.get_can_control(),
        coverArt: changed.get_cover_art(),
        position: changed.get_position(),
        length: changed.get_length(),
        volume: changed.get_volume(),
      });
    });
  });

  const visible = lastPlayer((lastPlayer) => !!lastPlayer?.title);
  const title = lastPlayer((lastPlayer) => lastPlayer?.title || "");
  const artist = lastPlayer((lastPlayer) =>
    lastPlayer?.artist ? `- ${lastPlayer.artist}` : "",
  );

  const menuBtnLabel = createComputed([title, artist], (title, artist) => {
    return [title, artist].filter(Boolean).join(" ");
  });

  const playBtnIcon = lastPlayer((player) => {
    return player?.playbackStatus === Mpris.PlaybackStatus.PLAYING
      ? "media-playback-pause"
      : player?.playbackStatus === Mpris.PlaybackStatus.PAUSED
        ? "media-playback-start"
        : "";
  });

  const isSensitivePlayOrPause = lastPlayer(
    (lastPlayer) => lastPlayer?.canPlayOrPause ?? false,
  );

  const isSensitiveNext = lastPlayer(
    (lastPlayer) => lastPlayer?.canNext ?? false,
  );

  const isSensitivePrev = lastPlayer(
    (lastPlayer) => lastPlayer?.canBack ?? false,
  );
  const position = lastPlayer((l) => l?.position);
  const length = lastPlayer((l) => l?.length);
  const volume = lastPlayer((l) => {
    return l?.volume;
  });

  const coverArt = lastPlayer((lastPlayer) => lastPlayer?.coverArt ?? "");
  const positionAdjustment = createComputed(
    [position, length, seekValue],
    (position, length, seekValue) => {
      return Gtk.Adjustment.new(
        seekValue ?? position ?? 0,
        0,
        length ?? 0,
        1,
        1,
        0,
      );
    },
  );
  const volumeAdjustment = createComputed([volume], (volume) => {
    return Gtk.Adjustment.new(volume ?? 0, 0, 1, 0.1, 0.1, 0);
  });

  const updateScale = (s: Gtk.Scale) => {
    const adjustment = s.get_adjustment();
    const v = adjustment.get_value();

    const lastPlayer = getLastPlayer(mpris.get_players());
    lastPlayer?.set_position(v);
    setSeekValue(null);
  };

  const updateScaleSeekValue = (s: Gtk.Scale) => {
    const v = s.get_value();
    setSeekValue(v);
  };

  return (
    <box>
      <menubutton visible={visible} halign={Gtk.Align.CENTER}>
        <box spacing={2}>
          <label label={menuBtnLabel} />
        </box>
        <popover $={(self) => (playerPopover = self)}>
          <box orientation={Gtk.Orientation.VERTICAL}>
            <button
              onClicked={() => {
                const player = getLastPlayer(mpris.get_players());
                console.log("click");

                const identify = player?.get_identity();
                console.log(player?.get_identity(), player?.get_entry());

                if (!identify) return;
                const client = Hyprland.get_default()
                  .get_clients()
                  .find((c) => {
                    console.log(
                      c.get_title(),
                      c.get_xwayland(),
                      c.get_class(),
                      c.get_address(),
                      c.get_pid(),
                    );
                    return c.get_title().includes(identify);
                  });

                client?.focus();
              }}
            >
              <image file={coverArt} pixelSize={200} />
            </button>

            <Gtk.Scale
              adjustment={positionAdjustment}
              draw_value={false}
              // value changed
              onValueChanged={(s) => {
                const adjustment = s.get_adjustment();
                const max = adjustment.get_upper();
                const value: number = adjustment.get_value();

                s.clear_marks();

                s.add_mark(0, Gtk.PositionType.BOTTOM, formatSeconds(value));
                s.add_mark(max, Gtk.PositionType.RIGHT, formatSeconds(max));
              }}
              $={(s) => {
                const keyController = Gtk.EventControllerKey.new();

                // the click controller doesn't receive the released event due to a bug
                // this fixes it: https://github.com/neithern/g4music/blob/master/src/ui/play-bar.vala#L167
                let clickCOntroller: Gtk.GestureClick | undefined = undefined;

                const controllers = s.observe_controllers();

                for (var i = 0; i < controllers.get_n_items(); i++) {
                  var controller = controllers.get_item(i);
                  if (controller instanceof Gtk.GestureClick) {
                    clickCOntroller = controller;
                    break;
                  }
                }

                if (!clickCOntroller) {
                  clickCOntroller = new Gtk.GestureClick();
                  s.add_controller(clickCOntroller);
                }

                keyController.connect("key-pressed", (_, keyval) => {
                  if (!getIsValidKeyForScale(keyval)) return;

                  updateScaleSeekValue(s);
                });

                keyController.connect("key-released", (_, keyval) => {
                  if (!getIsValidKeyForScale(keyval)) return;

                  updateScale(s);
                });

                clickCOntroller.connect("pressed", () => {
                  updateScaleSeekValue(s);
                });

                clickCOntroller.connect("released", () => {
                  updateScale(s);
                });

                //  we don't add the click controller again because it's not needed
                // s.add_controller(clickCOntroller);
                s.add_controller(keyController);
              }}
            />

            <centerbox>
              <box
                $type="center"
                orientation={Gtk.Orientation.HORIZONTAL}
                spacing={2}
                halign={Gtk.Align.CENTER}
              >
                <button
                  sensitive={isSensitivePrev}
                  onClicked={() => {
                    const lastPlayer = getLastPlayer(mpris.get_players());
                    setSeekValue(null);
                    lastPlayer?.previous();
                  }}
                >
                  <image iconName={"media-skip-backward"} />
                </button>

                <button
                  sensitive={isSensitivePlayOrPause}
                  onClicked={() => {
                    const lastPlayer = getLastPlayer(mpris.get_players());
                    setSeekValue(null);
                    lastPlayer?.play_pause();
                  }}
                >
                  <image iconName={playBtnIcon} />
                </button>

                <button
                  sensitive={isSensitiveNext}
                  onClicked={() => {
                    const lastPlayer = getLastPlayer(mpris.get_players());
                    lastPlayer?.next();
                  }}
                >
                  <image iconName={"media-skip-forward"} />
                </button>
              </box>

              <box $type="end">
                <Gtk.VolumeButton
                  adjustment={volumeAdjustment}
                  onValueChanged={(s) => {
                    const lastPlayer = getLastPlayer(mpris.get_players());
                    lastPlayer?.set_volume(s.get_value());
                  }}
                  orientation={Gtk.Orientation.HORIZONTAL}
                />
              </box>
            </centerbox>
          </box>
        </popover>
      </menubutton>
    </box>
  );
};

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const time = createPoll("", 1000, "date");
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <box $type="start">
          <Workspaces gdkmonitor={gdkmonitor} />
        </box>
        {/* <button */}
        {/*   $type="center" */}
        {/*   onClicked={() => execAsync("echo hello").then(console.log)} */}
        {/*   hexpand */}
        {/*   halign={Gtk.Align.CENTER} */}
        {/* > */}
        {/*   <label label="Welcome to AGS!" /> */}
        {/* </button> */}

        <box $type="center">
          <MprisRow gdkmonitor={gdkmonitor} />
        </box>

        <box $type="end">
          <TrayRow gdkmonitor={gdkmonitor} />
          <menubutton iconName="system-shutdown">
            <popover>
              <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                <button
                  onClicked={() => {
                    execAsync("loginctl lock-session");
                  }}
                >
                  <box>
                    <image iconName="system-lock-screen" />
                    <label label="Lock" />
                  </box>
                </button>

                <button>
                  <label label="⏻ Power Off" />
                </button>

                <button>
                  <label label="🔄 Restart" />
                </button>
              </box>
            </popover>
          </menubutton>
          <menubutton halign={Gtk.Align.CENTER}>
            <label label={time} />
            <popover>
              <Gtk.Calendar />
            </popover>
          </menubutton>
        </box>
      </centerbox>
    </window>
  );
}
