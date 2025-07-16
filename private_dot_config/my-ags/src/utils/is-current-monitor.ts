import { Gdk } from "ags/gtk4";
import Hyprland from "gi://AstalHyprland";

export const getIsCurrentMonitor = (
  hMonitor: Hyprland.Monitor,
  gMonitor: Gdk.Monitor,
) => {
  return hMonitor?.get_model() === gMonitor?.get_model();
};
