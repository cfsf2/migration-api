import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";
import Menu from "./Menu";

export default class MenuItem extends Base {
  public static table = "tbl_menu_item";

  @column()
  public nombre: string;

  @column()
  public url: string;

  @column()
  public id_menu: number;

  @column()
  public url_imagen: string;

  @column()
  public target: string;

  @column()
  public orden: number;

  @hasOne(() => Menu, {
    localKey: "id_menu",
    foreignKey: "id",
  })
  public menu: HasOne<typeof Menu>;
}
