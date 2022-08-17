import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Recupero extends BaseModel {
  public static table = "tbl_recupero";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_monodroga: number;

  @column()
  public nombre: string;

  @column()
  public fundamentos_tecnicos: string;

  @column()
  public porcentaje_recupero: number;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;
}
