import GObject, { property, register } from "ags/gobject";

type SelectCallback = (self: MainSearchListItemObject) => void;

@register({ GTypeName: "MainSearchListItem" })
export class MainSearchListItemObject extends GObject.Object {
  @property(String) text = "";
  @property(String) desc = "";
  @property(String) desktopIcon = "";

  private _onSelect?: SelectCallback;

  constructor({
    desktopIcon,
    text,
    onSelect,
    desc,
  }: {
    text: string;
    desktopIcon: string;
    desc: string;

    onSelect: SelectCallback;
  }) {
    super();

    this.text = text;
    this.desktopIcon = desktopIcon;
    this.desc = desc;
    this._onSelect = onSelect;
  }

  onSelect() {
    this._onSelect?.(this);
  }
}
