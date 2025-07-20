import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { spacing } from "../../constants/theme/spacing";
import Hyprland from "gi://AstalHyprland";
import Gio from "gi://Gio?version=2.0";
import AstalApps from "gi://AstalApps?version=0.1";
import { MainSearchListItemObject } from "../../objects/MainSearchListItemObject";
import {
  createAppsInstance,
  getAllCommands,
  runAppCommand,
} from "../../utils/apps";
import { MainSearchWindowContext } from "../../context/MainSearchWindowContext";
import {
  Accessor,
  createBinding,
  createComputed,
  createState,
  Setter,
} from "ags";
import { getIsCurrentMonitor } from "../../utils/is-current-monitor";
import { getIsIconFile } from "../../utils/icons";
import { windowNames } from "../../constants/windows";

const transitionDuration = 500;

class MyListItem extends Gtk.ListItem {
  _mainBox!: Gtk.Box;
  _textLabel!: Gtk.Label;
  _descLabel!: Gtk.Label;
  _image!: Gtk.Image;
}

const filterCommands = (commands: string[], query: string): string[] => {
  const lowerQuery = query.toLowerCase();

  return commands.filter((cmd) => {
    const name = cmd;

    // Check if query is substring of name or description
    return name.includes(lowerQuery);
  });
};

const addAppsToListStore = (
  listStore: Gio.ListStore,
  results: AstalApps.Application[],
) => {
  listStore.remove_all();

  results.forEach((r) => {
    const item = new MainSearchListItemObject({
      desktopIcon: r.get_icon_name(),
      text: r.get_name(),
      onSelect: () => r.launch(),
      desc: r.get_description(),
    });

    listStore.append(item);
  });
};

const addCommandsToListStore = (
  listStore: Gio.ListStore,
  results: string[],
) => {
  listStore.remove_all();

  results.forEach((r) => {
    const item = new MainSearchListItemObject({
      desktopIcon: "",
      text: r,
      onSelect: () => {
        runAppCommand(r);
      },
      desc: "",
    });

    listStore.append(item);
  });
};

const getAllAppsForList = (apps: AstalApps.Apps) => {
  return apps
    .get_list()
    .sort((a, b) => a.get_name().localeCompare(b.get_name()));
};

const MainSearch = ({
  listView,
  setListView,
  setSearchEntry,
  handleClose,

  apps,
}: {
  listView: Accessor<Gtk.ListView | undefined>;
  setListView: Setter<Gtk.ListView | undefined>;
  setSearchEntry: Setter<Gtk.SearchEntry | undefined>;
  handleClose: (immediate: boolean) => Promise<void>;
  apps: AstalApps.Apps;
}) => {
  const listStore = new Gio.ListStore();
  const model = new Gtk.SingleSelection({ model: listStore });
  const commands = getAllCommands();

  addAppsToListStore(listStore, getAllAppsForList(apps));

  const handleSelect = async () => {
    const selectedItem = model.get_selected_item<MainSearchListItemObject>();
    await handleClose(true);

    selectedItem.onSelect();
  };

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      valign={Gtk.Align.END}
      vexpand
      hexpand
    >
      <Gtk.ScrolledWindow maxContentHeight={600} propagateNaturalHeight>
        <Gtk.ListView
          vexpand
          $={(s) => {
            setListView(s);
          }}
          onActivate={() => {
            handleSelect();
          }}
          focusable={false}
          can_focus={false}
          model={model}
          factory={
            <Gtk.SignalListItemFactory
              onSetup={(_, l) => {
                const listItem = l as MyListItem;

                const mainBox = new Gtk.Box({
                  spacing: spacing.normal,
                });

                const rightBox = new Gtk.Box({
                  spacing: spacing.small,
                  orientation: Gtk.Orientation.VERTICAL,
                  valign: Gtk.Align.CENTER,
                });

                const textLabel = new Gtk.Label({
                  xalign: 0,
                });
                const descLabel = new Gtk.Label({
                  xalign: 0,
                  wrap: true,
                  maxWidthChars: 40,
                });
                const image = new Gtk.Image({
                  pixelSize: 40,
                });

                listItem._textLabel = textLabel;
                listItem._descLabel = descLabel;
                listItem._image = image;
                listItem._mainBox = mainBox;

                rightBox.append(textLabel);
                rightBox.append(descLabel);

                mainBox.append(image);
                mainBox.append(rightBox);

                listItem.set_child(mainBox);
              }}
              onBind={(_, l) => {
                const listItem = l as MyListItem;

                const textLabel = listItem._textLabel;
                const descLabel = listItem._descLabel;
                const image = listItem._image;
                const item = listItem.get_item<MainSearchListItemObject>();

                const icon = item.desktopIcon;

                if (icon) {
                  if (getIsIconFile({ icon })) {
                    image.set_from_file(icon);
                  } else {
                    image.set_from_icon_name(icon);
                  }
                } else {
                  image.set_visible(false);
                }

                textLabel?.set_text(item.text);

                if (item.desc) {
                  descLabel?.set_text(item.desc);
                } else {
                  descLabel.set_visible(false);
                }
              }}
            />
          }
        />
      </Gtk.ScrolledWindow>

      <Gtk.SearchEntry
        valign={Gtk.Align.END}
        onSearchChanged={(s) => {
          const text = s.get_text();

          if (text.startsWith(">")) {
            // handle other stuff
            const [_, ...rest] = text.split(">");
            const query = rest.join(">");

            if (query.length) {
              addCommandsToListStore(
                listStore,
                filterCommands(commands, query),
              );
            } else {
              addCommandsToListStore(listStore, commands);
            }
          } else {
            // handle apps
            if (text.length) {
              const results = apps.fuzzy_query(s.get_text());
              addAppsToListStore(listStore, results);
            } else {
              addAppsToListStore(listStore, getAllAppsForList(apps));
            }
          }
        }}
        onActivate={() => {
          handleSelect();
        }}
        onStopSearch={() => {
          handleClose(false);
        }}
        $={(s) => {
          const keyController = Gtk.EventControllerKey.new();

          keyController.connect("key-pressed", (_, keyval) => {
            if (keyval !== Gdk.KEY_Up && keyval !== Gdk.KEY_Down) {
              return false;
            }

            const index = model.get_selected();
            let newIndex = index;

            if (keyval == Gdk.KEY_Up && index > 0) {
              newIndex = index - 1;
            } else if (
              keyval == Gdk.KEY_Down &&
              index < listStore.get_n_items() - 1
            ) {
              newIndex = index + 1;
            }

            model.select_item(newIndex, true);

            listView.get()?.scroll_to(newIndex, null, null);
            return true; // avoid propagation
          });

          s.add_controller(keyController);

          setSearchEntry(s);
        }}
      />
    </box>
  );
};

const MainSearchWindow = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  const { BOTTOM } = Astal.WindowAnchor;
  const apps = createAppsInstance({ variant: "appSearch" });

  const { visible, setVisible } = MainSearchWindowContext.use();

  const hyprland = Hyprland.get_default();
  const focusedMonitor = createBinding(hyprland, "focusedMonitor");

  const [searchEntry, setSearchEntry] = createState<
    Gtk.SearchEntry | undefined
  >(undefined);
  const [listView, setListView] = createState<Gtk.ListView | undefined>(
    undefined,
  );
  const [windowInstance, setWindowInstance] = createState<
    Gtk.Window | undefined
  >(undefined);

  const [revealChild, setRevealChild] = createState(false);

  const isVisible = createComputed(
    [visible!, focusedMonitor],
    (visible, focusedMonitor) => {
      return (
        getIsCurrentMonitor(focusedMonitor, gdkmonitor) && visible === true
      );
    },
  );

  const handleClose = async (immediate: boolean) => {
    setRevealChild(false);

    const close = () => {
      setVisible?.(false);
      searchEntry.get()?.set_text("");
    };

    if (immediate) {
      close();
    } else {
      await new Promise((res) => {
        setTimeout(() => {
          close();
          res(true);
        }, transitionDuration - 100);
      });
    }
  };

  return (
    <window
      visible={isVisible}
      name={windowNames.NotificationWindow}
      class="MainSearchWindow"
      resizable={false}
      gdkmonitor={gdkmonitor}
      anchor={BOTTOM}
      exclusivity={Astal.Exclusivity.NORMAL}
      application={app}
      keymode={Astal.Keymode.EXCLUSIVE}
      onNotifyVisible={(win) => {
        const visible = win.is_visible();

        if (visible) {
          searchEntry.get()?.grab_focus();
          apps.reload(); // reload the list of apps in case of installed new app or similar
        }

        if (visible) {
          setRevealChild(visible);
        }
      }}
      $={(s) => {
        const clickHandler = Gtk.GestureClick.new();

        clickHandler.set_button(0); // listen any button

        clickHandler.connect("released", (_gesture, _n_press, x, y) => {
          let wx = x,
            wy = y;
          const result = windowInstance
            .get()
            ?.translate_coordinates(windowInstance.get()!, x, y);

          if (Array.isArray(result) && result[0]) {
            wx = result[1];
            wy = result[2];
          }

          const isInside = (widget: Gtk.Widget | undefined) => {
            if (!widget) return false;
            const alloc = widget.get_allocation();
            return (
              wx >= alloc.x &&
              wy >= alloc.y &&
              wx <= alloc.x + alloc.width &&
              wy <= alloc.y + alloc.height
            );
          };

          if (!isInside(searchEntry.get()) && !isInside(listView.get())) {
            handleClose(false);
          }
        });

        s.add_controller(clickHandler);
        setWindowInstance(s);
      }}
    >
      <Gtk.Revealer
        revealChild={revealChild}
        transition_type={Gtk.RevealerTransitionType.SLIDE_UP}
        transitionDuration={transitionDuration}
        widthRequest={800}
        heightRequest={800}
      >
        <box
          class={revealChild((v) => (v ? "MainSearch" : "MainSearch hide"))}
          valign={Gtk.Align.END}
        >
          <MainSearch
            listView={listView}
            setListView={setListView}
            setSearchEntry={setSearchEntry}
            handleClose={handleClose}
            apps={apps}
          />
        </box>
      </Gtk.Revealer>
    </window>
  );
};

export default MainSearchWindow;
