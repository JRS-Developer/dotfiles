import { createState, createComputed, onCleanup, Accessor, Setter } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import Mpris from "gi://AstalMpris";
import Cava from "gi://AstalCava";
import Hyprland from "gi://AstalHyprland";
import Cairo from "cairo";
import { formatSeconds } from "../utils/time";
import Pango from "gi://Pango";
import { usePlayerInfo } from "../hooks/usePlayerInfo";
import { PlayerListItemObject } from "../objects/PlayerListItemObject";
import CircularImage from "./CircularImage";
import { spacing } from "../constants/theme/spacing";
import { getIsIcon } from "../utils/icons";
import { useControlledScale } from "../hooks/useControlledScale";

// TODO: Add some way to update the volume by scrolling

class ListItemWithImage extends Gtk.ListItem {
  _image!: Gtk.Image;
  _label!: Gtk.Label;
}

function matchClientToPlayer(
  player: Mpris.Player,
): Hyprland.Client | undefined {
  const hypr = Hyprland.get_default();
  const entry = player.get_entry()?.toLowerCase().replace(/-/g, "_"); // normalize
  const identity = player.get_identity().toLowerCase();

  const clients = hypr.get_clients();

  return (
    clients.find((c) =>
      c
        .get_class()
        .toLowerCase()
        .includes(entry || identity),
    ) ?? clients.find((c) => c.get_title().toLowerCase().includes(identity))
  );
}

const Select = ({
  allPlayers,
  setSelectedPlayer,
  selectedIndex,
  selectionModel,
}: {
  allPlayers: Accessor<Mpris.Player[]>;
  setSelectedPlayer: Setter<Mpris.Player>;
  selectedIndex: Accessor<number>;
  selectionModel: Gtk.SingleSelection;
}) => {
  const [hasItems, setHasItems] = createState(selectionModel.get_n_items() > 0);

  selectionModel.connect("notify::n-items", () => {
    const itemsCount = selectionModel.get_n_items();
    setHasItems(itemsCount > 0);
  });
  return (
    <Gtk.DropDown
      model={selectionModel}
      selected={selectedIndex}
      sensitive={hasItems}
      onNotifySelectedItem={(s) => {
        const item = s.get_selected_item() as PlayerListItemObject;

        const player = allPlayers
          .get()
          .find((p) => p.get_bus_name() === item?.busName);

        if (player) {
          setSelectedPlayer(player);
        }
      }}
      factory={
        <Gtk.SignalListItemFactory
          onSetup={(_factoru, l) => {
            const listItem = l as ListItemWithImage;
            const box = new Gtk.Box({
              spacing: spacing.normal,
              orientation: Gtk.Orientation.HORIZONTAL,
            });
            const image = new Gtk.Image({
              iconName: "media-optical-symbolic", // you can change to any icon name
              pixelSize: 16,
            });

            const label = new Gtk.Label({ xalign: 0 });

            // Store references for use in `onBind`
            listItem._image = image;
            listItem._label = label;

            box.append(image);
            box.append(label);

            listItem.set_child(box);
          }}
          onBind={(_factory, l) => {
            const listItem = l as ListItemWithImage;

            const label = listItem._label as Gtk.Label;
            const image = listItem._image as Gtk.Image;

            const item = listItem.get_item<PlayerListItemObject>();

            label?.set_text(item.text);

            const display = Gdk.Display.get_default();
            if (display) {
              const iconTheme = Gtk.IconTheme.get_for_display(display);

              const icon = item.desktopIcon;

              if (getIsIcon({ icon, iconTheme })) {
                image.set_from_icon_name(icon);
              } else {
                image.set_from_icon_name("multimedia-player-symbolic");
              }
            }
          }}
        />
      }
    ></Gtk.DropDown>
  );
};

const MediaPlayer = ({ variant }: { variant: "complete" | "minimal" }) => {
  const {
    playerInfo: {
      canLoop,
      coverArt,
      playbackStatus,
      canPlayOrPause,
      canNext,
      canBack,
      position,
      length,
      album,
      loopStatus,
      canShuffle,
      shuffleStatus,
      artist,
      title,
    },
    selectedPlayer,
    setSelectedPlayer,
    allPlayers,
    selectedIndex,
    selectionModel,
  } = usePlayerInfo();

  const playBtnIcon = playbackStatus((playbackStatus) => {
    return playbackStatus === Mpris.PlaybackStatus.PLAYING
      ? "media-playback-pause"
      : playbackStatus === Mpris.PlaybackStatus.PAUSED
        ? "media-playback-start"
        : "media-playback-stop";
  });

  const songLabel = createComputed([title, artist], (...args) => {
    return args.filter(Boolean).join(" - ") || "Nothing Playing";
  });

  const isSensitivePlayOrPause = canPlayOrPause;
  const isSensitiveNext = canNext;
  const isSensitivePrev = canBack;

  const {
    restartAdjustment,
    setup,
    state: { setIsSeeking },
    adjustment,
  } = useControlledScale({
    value: position,
    limit: length,
    incrementer: 1,
    updateValue: (v) => {
      selectedPlayer.get()?.set_position(v);
    },
    variant: "seek",
  });

  const cava = Cava.get_default();
  cava?.set_bars(48);
  let cavaDrawingArea: Gtk.DrawingArea | undefined;
  let imgDrawingArea: Gtk.DrawingArea | undefined;

  const [cavaBars, setCavaBars] = createState<number[]>(
    new Array(cava?.get_bars()).fill(0),
  );

  const convertUnsubscribe = coverArt.subscribe(() => {
    imgDrawingArea?.queue_draw();
  });

  const selectedPlayerUnsubscribe = selectedPlayer.subscribe(() => {
    const length = selectedPlayer.get().get_length() ?? 0;
    const position = selectedPlayer.get().get_position() ?? 0;
    // we need to restart the whole positionAdjustment to update the max length correctly when changing players
    // without this the upper or max value is not updated
    restartAdjustment({
      value: position,
      limit: length,
    });
  });

  cava?.connect("notify::values", () => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const isPlaying = playbackStatus.get() === Mpris.PlaybackStatus.PLAYING;

    const myBars: number[] = [...cavaBars.get()];
    const values = cava.get_values();
    const bars = cava.get_bars();

    for (let i = 0; i < bars; i++) {
      const newVal = values[i] ?? 1;

      if (isPlaying) {
        myBars[i] = lerp(myBars[i], newVal, 0.3); // smooth transition
      } else {
        myBars[i] = lerp(myBars[i], 0, 0.1); // smooth transition
      }
    }

    setCavaBars(myBars);
    cavaDrawingArea?.queue_draw();
  });

  onCleanup(() => {
    convertUnsubscribe();
    selectedPlayerUnsubscribe();
  });

  return (
    <box
      orientation={
        variant === "complete"
          ? Gtk.Orientation.HORIZONTAL
          : Gtk.Orientation.VERTICAL
      }
      hexpand
      spacing={spacing.small}
    >
      <overlay>
        <box
          heightRequest={variant === "complete" ? 300 : 100}
          widthRequest={variant === "complete" ? 300 : 150}
        />
        <CircularImage
          $type="overlay"
          img={coverArt}
          size={variant === "complete" ? 180 : 90}
          iconFallback="media-album-track"
        />
        <Gtk.DrawingArea
          $type="overlay"
          contentWidth={280}
          contentHeight={280}
          visible={variant === "complete"}
          class="MediaPlayerBars"
          hexpand={true}
          vexpand={true}
          $={(s) => {
            s.set_draw_func((widget, cr, width, height) => {
              const bars = cavaBars.get(); // Your cava bars data

              const cx = width / 2;
              const cy = height / 2;
              const radius = 100;
              const maxBarLength = 80;
              const count = bars.length;

              const color = widget.get_color();

              for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const barLength = Math.pow(bars[i], 1.5) * maxBarLength;

                const x1 = cx + Math.cos(angle) * radius;
                const y1 = cy + Math.sin(angle) * radius;
                const x2 = cx + Math.cos(angle) * (radius + barLength);
                const y2 = cy + Math.sin(angle) * (radius + barLength);

                cr.setSourceRGBA(
                  color.red,
                  color.green,
                  color.blue,
                  color.alpha,
                );
                cr.setLineWidth(4);
                cr.setLineCap(Cairo.LineCap.ROUND); // this rounds the line ends
                cr.moveTo(x1, y1);
                cr.lineTo(x2, y2);
                cr.stroke();
              }
            });
            cavaDrawingArea = s;
          }}
        />
      </overlay>

      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={spacing.xSmall}
        valign={Gtk.Align.CENTER}
      >
        <box
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          orientation={Gtk.Orientation.VERTICAL}
        >
          <box
            widthRequest={100}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
          >
            <label
              label={songLabel}
              class="MediaPlayerSongLabel"
              ellipsize={Pango.EllipsizeMode.END}
              maxWidthChars={variant === "complete" ? 50 : 30}
            />
          </box>
          <box
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            visible={album((v) => !!v)}
          >
            <label
              label={album}
              ellipsize={Pango.EllipsizeMode.END}
              maxWidthChars={variant === "complete" ? 50 : 30}
            />
          </box>
        </box>

        <Gtk.Scale
          marginStart={16}
          marginEnd={16}
          sensitive={isSensitivePlayOrPause}
          adjustment={adjustment}
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
            setup(s);
          }}
        />

        <centerbox hexpand>
          {variant === "complete" ? (
            <box $type="start" spacing={spacing.small}>
              <Gtk.ToggleButton
                sensitive={canLoop}
                active={loopStatus(
                  (s) => s === Mpris.Loop.PLAYLIST || s === Mpris.Loop.TRACK,
                )}
                onClicked={() => {
                  selectedPlayer.get().loop();
                }}
              >
                <image
                  iconName={loopStatus((status) => {
                    if (status === Mpris.Loop.TRACK) {
                      return "media-playlist-repeat-song";
                    } else {
                      return "media-playlist-repeat";
                    }
                  })}
                />
              </Gtk.ToggleButton>

              <Gtk.ToggleButton
                sensitive={canShuffle}
                active={shuffleStatus((s) => s === Mpris.Shuffle.ON)}
                onClicked={() => {
                  // it toggles correctly setting always ON, crazy
                  selectedPlayer.get().set_shuffle_status(Mpris.Shuffle.ON);
                }}
              >
                <image
                  iconName={shuffleStatus((status) => {
                    if (status === Mpris.Shuffle.OFF) {
                      return "media-playlist-no-shuffle";
                    } else {
                      return "media-playlist-shuffle";
                    }
                  })}
                />
              </Gtk.ToggleButton>
              <button
                iconName="edit-find"
                onClicked={() => {
                  const player = selectedPlayer.get();
                  const client = player && matchClientToPlayer(player);
                  client?.focus();
                }}
              />
            </box>
          ) : null}
          <box
            $type="center"
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={spacing.small}
            halign={Gtk.Align.CENTER}
          >
            <button
              sensitive={isSensitivePrev}
              onClicked={() => {
                setIsSeeking(false);
                selectedPlayer.get()?.previous();
              }}
              class={variant === "complete" ? "" : "flat"}
            >
              <image iconName={"media-skip-backward"} />
            </button>

            <button
              sensitive={isSensitivePlayOrPause}
              class="circular"
              onClicked={() => {
                setIsSeeking(false);
                selectedPlayer.get()?.play_pause();
              }}
            >
              <image iconName={playBtnIcon} />
            </button>

            <button
              sensitive={isSensitiveNext}
              onClicked={() => {
                selectedPlayer.get()?.next();
              }}
              class={variant === "complete" ? "" : "flat"}
            >
              <image iconName={"media-skip-forward"} />
            </button>
          </box>

          {/* We need to fix it because changing the volume in the app causes the onValueChanged to trigger causing */}
          {/* an infinite change of volume */}
          {/* <box $type="end"> */}
          {/*   <Gtk.VolumeButton */}
          {/*     adjustment={volumeAdjustment} */}
          {/*     onValueChanged={(s) => { */}
          {/*       selectedPlayer?.get()?.set_volume(s.get_value()); */}
          {/*     }} */}
          {/*     orientation={Gtk.Orientation.HORIZONTAL} */}
          {/*   /> */}
          {/* </box> */}
          {variant === "complete" ? (
            <box $type="end" css="margin-left:8px;">
              <Select
                allPlayers={allPlayers}
                selectedIndex={selectedIndex}
                setSelectedPlayer={setSelectedPlayer}
                selectionModel={selectionModel}
              />
            </box>
          ) : null}
        </centerbox>
      </box>
    </box>
  );
};

export default MediaPlayer;
