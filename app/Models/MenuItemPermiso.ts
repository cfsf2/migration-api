import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";
import MenuItem from "./MenuItem";
import Permiso from "./Permiso";

export default class MenuItemPermiso extends Base {
  public static table = "tbl_item_menu_permiso";

  @column()
  public id_menu_item: number;

  @column()
  public id_permiso: number;

  @hasOne(() => MenuItem, {
    localKey: "id_menu_item",
    foreignKey: "id",
  })
  public menuItem: HasOne<typeof MenuItem>;

  @hasOne(() => Permiso, {
    localKey: "id_permiso",
    foreignKey: "id",
  })
  public permiso: HasOne<typeof Permiso>;
}
