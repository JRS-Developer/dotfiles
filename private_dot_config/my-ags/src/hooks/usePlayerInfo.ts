import { createState, onCleanup, createBinding, Accessor } from "ags";
import Mpris from "gi://AstalMpris";
import { getIsLastPlayer, getLastPlayer } from "../utils/mpris/get-last-player";
import Gio from "gi://Gio";
import Apps from "gi://AstalApps";
import { Gtk } from "ags/gtk4";
import { PlayerListItemObject } from "../objects/PlayerListItemObject";
import { createAppsInstance, searchAppFromName } from "../utils/apps";

const callbackIfCurrent = (
  callback: (changed: Mpris.Player) => void,
  getIsWantedPlayer: (player: Mpris.Player) => boolean,
) => {
  return (changed: Mpris.Player) => {
    if (getIsWantedPlayer(changed)) callback(changed);
  };
};

const bindProperty = <K extends keyof Mpris.Player>(
  player: Mpris.Player,
  _property: K,
  signal: string,
  getValue: (p: Mpris.Player) => Mpris.Player[K],
  setState: (val: Mpris.Player[K]) => void,
  getIsWantedPlayer: (player: Mpris.Player) => boolean,
) => {
  player.connect(
    signal,
    callbackIfCurrent((changed) => {
      setState(getValue(changed));
    }, getIsWantedPlayer),
  );
};

const getters = {
  getCanPlayOrPause(player: Mpris.Player | undefined) {
    if (!player) return false;
    return player.get_can_control() && player.get_playback_status() !== 2;
  },
  getCanLoop(player: Mpris.Player | undefined) {
    if (!player) return false;
    return player.get_loop_status() !== Mpris.Loop.UNSUPPORTED;
  },
  getCanShuffle(player: Mpris.Player | undefined) {
    if (!player) return false;
    return player.get_shuffle_status() !== Mpris.Shuffle.UNSUPPORTED;
  },
  getTitle(player: Mpris.Player | undefined) {
    return player?.get_title() ?? "";
  },
  getArtist(player: Mpris.Player | undefined) {
    return player?.get_artist() ?? "";
  },
  getAlbum(player: Mpris.Player | undefined) {
    return player?.get_album() ?? "";
  },

  getCoverArt(player: Mpris.Player | undefined) {
    return player?.get_cover_art() ?? "";
  },
  getPosition(player: Mpris.Player | undefined) {
    return player?.get_position() ?? 0;
  },
  getLength(player: Mpris.Player | undefined) {
    return player?.get_length() ?? 0;
  },
  getVolume(player: Mpris.Player | undefined) {
    return player?.get_volume() ?? 100;
  },
  getLoopStatus(player: Mpris.Player | undefined) {
    return player?.get_loop_status() ?? Mpris.Loop.UNSUPPORTED;
  },
  getShuffleStatus(player: Mpris.Player | undefined) {
    return player?.get_shuffle_status() ?? Mpris.Shuffle.UNSUPPORTED;
  },
  getCanRaise(player: Mpris.Player | undefined) {
    return player?.get_can_raise() ?? false;
  },
  getCanNext(player: Mpris.Player | undefined) {
    return player?.get_can_go_next() ?? false;
  },
  getCanBack(player: Mpris.Player | undefined) {
    return player?.get_can_go_previous() ?? false;
  },
  getPlaybackStatus(player: Mpris.Player | undefined) {
    return player?.get_playback_status() ?? Mpris.PlaybackStatus.STOPPED;
  },
};

const addPlayersToListStore = (
  listStore: Gio.ListStore,
  allPlayers: Accessor<Mpris.Player[]>,
  apps: Apps.Apps,
) => {
  listStore.remove_all();

  let seen: Record<string, boolean> = {};

  allPlayers.get().forEach((p) => {
    const trackId = p.get_trackid();
    const key = trackId;
    if (seen[key]) {
      return;
    }

    seen[key] = true;
    const identity = p.get_identity();

    if (!identity) return;

    const app = searchAppFromName(apps, identity);
    const icon = app?.[0]?.get_icon_name();

    const item = new PlayerListItemObject({
      text: identity,
      desktopIcon: icon,
      busName: p.get_bus_name(),
    });
    listStore.append(item);
  });
};

const findSelectedItemIndex = (
  allPlayers: Accessor<Mpris.Player[]>,
  selectedPlayer: Accessor<Mpris.Player>,
): number => {
  const foundIndex: number = allPlayers
    .get()
    .findIndex((p) => p.get_bus_name() === selectedPlayer.get().get_bus_name());
  return foundIndex > -1 ? foundIndex : 0;
};

export const usePlayerInfo = () => {
  const mpris = Mpris.get_default();
  const players = createBinding(mpris, "players");
  const [selectedPlayer, setSelectedPlayer] = createState(
    getLastPlayer(players.get()) ?? players.get()?.[0],
  );

  const [selectedIndex, setSelectedIndex] = createState(
    findSelectedItemIndex(players, selectedPlayer),
  );

  const apps = createAppsInstance({ variant: "other" });
  const liststore = new Gio.ListStore();
  addPlayersToListStore(liststore, players, apps);

  const selectionModel = new Gtk.SingleSelection({ model: liststore });

  const getIsWantedPlayer = (player: Mpris.Player) =>
    player.get_bus_name() === selectedPlayer.get()?.get_bus_name();

  const p = selectedPlayer.get();

  const [title, setTitle] = createState(getters.getTitle(p));
  const [artist, setArtist] = createState(getters.getArtist(p));
  const [album, setAlbum] = createState(getters.getAlbum(p));
  const [coverArt, setCoverArt] = createState(getters.getCoverArt(p));
  const [playbackStatus, setPlaybackStatus] = createState(
    p?.get_playback_status(),
  );
  const [position, setPosition] = createState(getters.getPosition(p));
  const [length, setLength] = createState(getters.getLength(p));
  const [volume, setVolume] = createState(getters.getVolume(p));
  const [loopStatus, setLoopStatus] = createState(getters.getLoopStatus(p));
  const [shuffleStatus, setShuffleStatus] = createState(
    getters.getShuffleStatus(p),
  );
  const [canRaise, setCanRaise] = createState(getters.getCanRaise(p));
  const [canNext, setCanNext] = createState(getters.getCanNext(p));
  const [canBack, setCanBack] = createState(getters.getCanBack(p));
  const [canPlayOrPause, setCanPlayOrPause] = createState(
    getters.getCanPlayOrPause(p),
  );
  const [canLoop, setCanLoop] = createState(getters.getCanLoop(p));
  const [canShuffle, setCanShuffle] = createState(getters.getCanShuffle(p));

  const unsubscribeSelectedPlayer = selectedPlayer.subscribe(() => {
    const p = selectedPlayer.get();
    setTitle(getters.getTitle(p));
    setArtist(getters.getArtist(p));
    setPlaybackStatus(getters.getPlaybackStatus(p));
    setCoverArt(getters.getCoverArt(p));
    setAlbum(getters.getAlbum(p));
    setPosition(getters.getPosition(p));
    setLength(getters.getLength(p));
    setVolume(getters.getVolume(p));
    setLoopStatus(getters.getLoopStatus(p));
    setShuffleStatus(getters.getShuffleStatus(p));
    setCanRaise(getters.getCanRaise(p));
    setCanNext(getters.getCanNext(p));
    setCanBack(getters.getCanBack(p));
    setCanPlayOrPause(getters.getCanPlayOrPause(p));
    setCanLoop(getters.getCanLoop(p));
    setCanShuffle(getters.getCanShuffle(p));

    const index = findSelectedItemIndex(players, selectedPlayer);
    setSelectedIndex(index);
  });

  players.get().forEach((player) => {
    bindProperty(
      player,
      "title",
      "notify::title",
      getters.getTitle,
      setTitle,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "artist",
      "notify::artist",
      getters.getArtist,
      setArtist,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "album",
      "notify::album",
      getters.getAlbum,
      setAlbum,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "cover_art",
      "notify::cover-art",
      getters.getCoverArt,
      setCoverArt,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "playback_status",
      "notify::playback-status",
      getters.getPlaybackStatus,
      setPlaybackStatus,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "position",
      "notify::position",
      getters.getPosition,
      setPosition,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "length",
      "notify::length",
      getters.getLength,
      setLength,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "volume",
      "notify::volume",
      getters.getVolume,
      setVolume,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "loop_status",
      "notify::loop-status",
      getters.getLoopStatus,
      setLoopStatus,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "shuffle_status",
      "notify::shuffle-status",
      getters.getShuffleStatus,
      setShuffleStatus,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "can_raise",
      "notify::can-raise",
      getters.getCanRaise,
      setCanRaise,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "can_go_next",
      "notify::can-go-next",
      getters.getCanNext,
      setCanNext,
      getIsWantedPlayer,
    );
    bindProperty(
      player,
      "can_go_previous",
      "notify::can-go-previous",
      getters.getCanBack,
      setCanBack,
      getIsWantedPlayer,
    );

    player.connect(
      "notify",
      callbackIfCurrent((p) => {
        setCanPlayOrPause(getters.getCanPlayOrPause(p));
        setCanLoop(getters.getCanLoop(p));
        setCanShuffle(getters.getCanShuffle(p));
      }, getIsWantedPlayer),
    );

    // we update the selected player when the last player is changed
    player.connect("notify::trackid", (p) => {
      const isLastPlayer: boolean = getIsLastPlayer(p);
      if (!isLastPlayer) return;

      setSelectedPlayer(p);
      addPlayersToListStore(liststore, players, apps);
    });
  });

  const unsubscribeAllPlayers = players.subscribe(() => {
    addPlayersToListStore(liststore, players, apps);
  });

  onCleanup(() => {
    unsubscribeSelectedPlayer();
    unsubscribeAllPlayers();
  });

  return {
    playerInfo: {
      title,
      artist,
      album,
      coverArt,
      playbackStatus,
      position,
      length,
      volume,
      loopStatus,
      shuffleStatus,
      canRaise,
      canNext,
      canBack,
      canPlayOrPause,
      canLoop,
      canShuffle,
    },
    selectedPlayer,
    setSelectedPlayer,
    selectionModel,
    selectedIndex,
    allPlayers: players,
  };
};
