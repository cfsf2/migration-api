import { DateTime } from "luxon";
import { column } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";

export default class Evento extends Base {
  public static table = "tbl_evento";

  @column()
  public nombre: string;
  @column()
  public fecha: DateTime;
  @column()
  public observaciones: string;
  @column()
  public fecha_inicio_campana: DateTime;
  @column()
  public fecha_fin_campana: DateTime;
  @column()
  public valor_entrada: number;
}
