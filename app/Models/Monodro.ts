import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Monodro extends BaseModel {
  public static table = "monodro";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public codigo: number;

  @column()
  public descripcion: string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;
}
