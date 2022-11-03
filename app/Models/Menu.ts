import { DateTime } from "luxon";
import { BaseModel, column, HasMany, hasMany } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";
import MenuItem from "./MenuItem";

export default class Menu extends Base {
  public static table = "tbl_menu";

  @column()
  public nombre: string;

  @column()
  public id_a: string;

  @hasMany(() => MenuItem, {
    localKey: "id",
    foreignKey: "id_menu",
  })
  public menuItems: HasMany<typeof MenuItem>;
}
