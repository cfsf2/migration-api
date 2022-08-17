import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Diagnostico extends BaseModel {
  public static table = "diagnosticos";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public codigo: string;

  @column()
  public nombre: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
