import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class SErrorMysql extends BaseModel {
  public static table = "s_error_mysql";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public error_mysql: string;

  @column()
  public detalle: string;

  @column.dateTime({ autoCreate: true })
  public ts_ceacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;
}
