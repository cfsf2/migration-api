import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";

export default class MenuItemTipo extends Base {
  public static table = "tbl_menu_item_tipo";

  @column()
  public nombre: string;

  @column()
  public id_a: string;
}
