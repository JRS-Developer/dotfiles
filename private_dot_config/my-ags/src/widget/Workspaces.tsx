import { Accessor, createBinding, createComputed, createState, For } from "ags";
import { Gdk } from "ags/gtk4";
import Hyprland from "gi://AstalHyprland";
import { getAppIcon, getIsIconFile } from "../utils/icons";
import { getWorkspacesOfCurrentMonitor } from "../utils/workspaces";
import { EmptyHyprlandWorkspace } from "../objects/EmptyHyprlandWorkspace";

const ClientItem = ({
  client,
  focusedClient,
  hasMoreClients,
}: {
  client: Hyprland.Client;
  focusedClient: Accessor<Hyprland.Client>;
  hasMoreClients: Accessor<boolean>;
}) => {
  const found = getAppIcon(client.get_class());
  const isIcon = getIsIconFile({ icon: found }) === false;
  const title = createBinding(client, "title");

  const isFocused = focusedClient(
    (c) => c?.get_address() === client?.get_address(),
  );

  const className = createComputed(
    [isFocused, hasMoreClients],
    (isFocused, hasMoreClients) => {
      let res = "WorkspaceClientItem circular";

      if (isFocused === true) {
        res += " focused";
      } else if (hasMoreClients === true) {
        res += " flat";
      }

      return res;
    },
  );
  return (
    <button
      class={className}
      tooltipText={title}
      onClicked={() => {
        const isCurrentlyFocused = isFocused.get();
        if (isCurrentlyFocused === true) return;

        client.focus();
      }}
      focusable={false}
    >
      <image
        iconName={isIcon ? found : undefined}
        visible={!!found}
        file={isIcon ? undefined : found}
      />
    </button>
  );
};

const WorkspaceItem = ({
  workspace,
  focusedClient,
  focusedWorkspaceId,
  hyprland,
  index,
}: {
  focusedWorkspaceId: Accessor<number>;
  workspace: Hyprland.Workspace | EmptyHyprlandWorkspace;
  focusedClient: Accessor<Hyprland.Client>;
  hyprland: Hyprland.Hyprland;
  index: Accessor<number>;
}) => {
  const clients = createBinding(workspace, "clients");
  const hasNoClients = clients((c) => c.length > 0 === false);

  const className = clients((clients) => {
    let res = "WorkspaceItem";

    if (clients.length > 1) {
      res += " group";
    }

    return res;
  });

  const isFocusedEmpty = focusedWorkspaceId((v) => {
    return workspace.get_id() === v;
  });

  return (
    <box class={className}>
      <For each={clients}>
        {(client) => (
          <ClientItem
            client={client}
            focusedClient={focusedClient}
            hasMoreClients={clients((c) => c.length > 1)}
          />
        )}
      </For>

      <button
        visible={hasNoClients}
        class={isFocusedEmpty((v) =>
          v === true ? "WorkspaceClientItem focused" : "WorkspaceClientItem",
        )}
        onClicked={() => {
          hyprland.dispatch("split-workspace", (index.get() + 1).toString());
        }}
        tooltipText={"Vacio"}
      >
        <label label="•" />
      </button>
    </box>
  );
};
const Workspaces = ({
  gdkmonitor,
  index,
}: {
  gdkmonitor: Gdk.Monitor;
  index: number;
}) => {
  const hyprland = Hyprland.get_default();
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");
  const focusedWorkspaceId = focusedWorkspace((v) => v?.get_id());

  const [workspaces, setWorkspaces] = createState(
    getWorkspacesOfCurrentMonitor(hyprland, gdkmonitor, index),
  );
  const focusedClient = createBinding(hyprland, "focused_client");

  hyprland.connect("notify::workspaces", () => {
    const newWorkspaces = getWorkspacesOfCurrentMonitor(
      hyprland,
      gdkmonitor,
      index,
    );

    setWorkspaces(newWorkspaces);
  });

  return (
    <box class="Workspaces">
      <For each={workspaces}>
        {(item, index) => (
          <WorkspaceItem
            index={index}
            hyprland={hyprland}
            focusedWorkspaceId={focusedWorkspaceId}
            workspace={item}
            focusedClient={focusedClient}
          />
        )}
      </For>
    </box>
  );
};

export default Workspaces;
