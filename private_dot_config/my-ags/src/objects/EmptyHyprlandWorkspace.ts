import GObject, { property, register } from "ags/gobject";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

@register({ GTypeName: "EmptyHyprlandWorkspace" })
export class EmptyHyprlandWorkspace extends GObject.Object {
  @property(Number) id = 0;

  constructor({ id }: { id: number }) {
    super();

    this.id = id;
  }

  get_id(): number {
    return this.id;
  }

  get_clients(): AstalHyprland.Client[] {
    return [];
  }

  get clients(): AstalHyprland.Client[] {
    return this.get_clients();
  }
}
