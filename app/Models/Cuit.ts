import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Cuit extends BaseModel {
  public static table = "_cuit";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public matricula: number;

  @column()
  public telefono: string;

  @column()
  public cuit: number;

  @column()
  public id_usuario_creacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;
}
