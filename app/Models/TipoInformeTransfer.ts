import { column } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";

export default class TipoInformeTransfer extends Base {
  @column()
  public id_a: string;

  @column()
  public nombre: string;
}
