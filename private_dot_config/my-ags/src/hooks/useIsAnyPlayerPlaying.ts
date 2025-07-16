import {
  Accessor,
  createBinding,
  createComputed,
  createState,
  onCleanup,
} from "ags";
import Mpris from "gi://AstalMpris";

const getPlayersPlaying = (players: Accessor<Mpris.Player[]>) => {
  return players.get().map((p) => ({
    busName: p.get_bus_name(),
    isPlaying: p.get_playback_status() === Mpris.PlaybackStatus.PLAYING,
  }));
};

export const useIsAnyPlayerPlaying = () => {
  const mpris = Mpris.get_default();
  const allPlayers = createBinding(mpris, "players");

  const [playersPlaying, setPlayersPlaying] = createState(
    getPlayersPlaying(allPlayers),
  );

  const isAnyPlayerPlaying = createComputed([playersPlaying], (players) => {
    return players.some((p) => !!p.isPlaying);
  });

  allPlayers.get().forEach((player) => {
    player.connect("notify::playback-status", () => {
      setPlayersPlaying(getPlayersPlaying(allPlayers));
    });
  });

  const unsubscribePlayers = allPlayers.subscribe(() => {
    setPlayersPlaying(getPlayersPlaying(allPlayers));
  });

  onCleanup(() => {
    unsubscribePlayers();
  });

  return isAnyPlayerPlaying;
};
