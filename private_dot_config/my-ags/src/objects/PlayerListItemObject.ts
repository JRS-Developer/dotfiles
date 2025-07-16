import GObject, { property, register } from "ags/gobject";

@register({ GTypeName: "PlayerListItem" })
export class PlayerListItemObject extends GObject.Object {
  @property(String) text = "";
  @property(String) desktopIcon = "";
  @property(String) busName = "";

  constructor({
    busName,
    desktopIcon,
    text,
  }: {
    text: string;
    desktopIcon: string;
    busName: string;
  }) {
    super();

    this.text = text;
    this.desktopIcon = desktopIcon;
    this.busName = busName;
  }
}
