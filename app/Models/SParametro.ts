import { column } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";

export default class SParametro extends Base {
  public static table = "s_parametro";

  @column()
  public id_a: string;
  @column()
  public valor: string;
}
