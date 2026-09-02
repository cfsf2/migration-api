import { column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";
import MenuItem from "./MenuItem";

export default class MenuItemCpsc extends Base {
  public static table = "tbl_menu_item_cpsc";

  @column()
  public id_menu_item: number;

  @column()
  public id_menu_item_hijo: number;

  @column()
  public orden: number;

  @hasOne(() => MenuItem, {
    localKey: "id_menu_item",
    foreignKey: "id",
  })
  public menuItem: HasOne<typeof MenuItem>;

  @hasOne(() => MenuItem, {
    localKey: "id_menu_item_hijo",
    foreignKey: "id",
  })
  public menuItemHijo: HasOne<typeof MenuItem>;
}
