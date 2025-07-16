import { createBinding, createState, For } from "ags";
import AstalTray from "gi://AstalTray";
import { spacing } from "../constants/theme/spacing";

const getFinalTooltipMarkup = (item: AstalTray.TrayItem): string => {
  return item.get_tooltip_markup() || item.get_title();
};

const TrayItem = ({ item }: { item: AstalTray.TrayItem }) => {
  const hasItems: boolean = !!(item.get_menu_model()?.get_n_items() satisfies
    | number
    | undefined);

  const [finalTooltipMarkup, setFinalTooltipMarkup] = createState(
    getFinalTooltipMarkup(item),
  );

  const gicon = createBinding(item, "gicon");
  const menuModel = createBinding(item, "menuModel");

  item.connect("notify::tooltip", (s) => {
    // notify::tooltip-markup doesn't do anything but notify::tooltip does
    setFinalTooltipMarkup(getFinalTooltipMarkup(s));
  });

  item.connect("notify::title", (s) => {
    setFinalTooltipMarkup(getFinalTooltipMarkup(s));
  });

  if (hasItems)
    return (
      <menubutton
        class={"flat"}
        $={(s) => {
          // pass actions so it can work
          const actions = item.get_action_group();
          // dbusmenu is needed, it makes it work, it was in the docs
          if (actions) s.insert_action_group("dbusmenu", actions);
        }}
        // generally they don't have tooltip_markup but just in case
        tooltip_markup={finalTooltipMarkup}
        menuModel={menuModel}
      >
        <image gicon={gicon} />
      </menubutton>
    );

  return (
    <button
      css={"flat"}
      onClicked={() => {
        item.activate(0, 0);
      }}
      tooltip_markup={finalTooltipMarkup}
    >
      <image gicon={gicon} />
    </button>
  );
};

const Tray = () => {
  const tray = AstalTray.get_default();
  const items = createBinding(tray, "items");

  return (
    <box
      class="TrayRow"
      spacing={spacing.small}
      visible={items((items) => items.length > 0)}
    >
      <For each={items}>{(item) => <TrayItem item={item} />}</For>
    </box>
  );
};

export default Tray;
