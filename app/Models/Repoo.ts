import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class Repoo extends BaseModel {
  public static table = "tbl_repoo";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public oossInactivas: string;

  @column()
  public available: string;

  @column()
  public alert: string;

  @column()
  public attachName: string;

  @column()
  public mimetype: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;
}
