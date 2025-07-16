import { Gdk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { getIsCurrentMonitor } from "./is-current-monitor";
import { EmptyHyprlandWorkspace } from "../objects/EmptyHyprlandWorkspace";

const workspacesLimit = 5;

export const getWorkspacesOfCurrentMonitor = (
  hyprland: AstalHyprland.Hyprland,
  gdkmonitor: Gdk.Monitor,
  monitorIndex: number,
): (AstalHyprland.Workspace | EmptyHyprlandWorkspace)[] => {
  const workspaces = hyprland.get_workspaces();
  const existing = workspaces.filter((w) => {
    return getIsCurrentMonitor(w.get_monitor(), gdkmonitor);
  });

  const byId = new Map(existing.map((w) => [w.get_id(), w]));

  const result: (AstalHyprland.Workspace | EmptyHyprlandWorkspace)[] = [];

  for (let i = 1; i <= workspacesLimit; i++) {
    const id = i + workspacesLimit * monitorIndex;
    const ws = byId.get(id);

    if (ws) {
      result.push(ws);
    } else {
      // Create a fake empty workspace object
      const fake = new EmptyHyprlandWorkspace({
        id,
      });

      result.push(fake);
    }
  }

  return result;
};
