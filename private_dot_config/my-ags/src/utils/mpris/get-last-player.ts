import Mpris from "gi://AstalMpris";

export const getIsLastPlayer = (p: Mpris.Player) => {
  return p.get_bus_name().includes("playerctld");
};

export const getLastPlayer = (players: Mpris.Player[]) => {
  return players.find((p) => getIsLastPlayer(p));
};
