import { column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";
import MenuItem from "./MenuItem";
import Institucion from "./Institucion";

export default class MenuItemInstitucion extends Base {
  public static table = "tbl_item_menu_permiso";

  @column()
  public id_menu_item: number;

  @column()
  public id_institucion: number;

  @hasOne(() => MenuItem, {
    localKey: "id_menu_item",
    foreignKey: "id",
  })
  public menuItem: HasOne<typeof MenuItem>;

  @hasOne(() => Institucion, {
    localKey: "id_institucion",
    foreignKey: "id",
  })
  public institucion: HasOne<typeof Institucion>;
}
