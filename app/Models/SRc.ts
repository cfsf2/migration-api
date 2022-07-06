import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class SRc extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_registro: number;

  @column()
  public tabla: string;

  @column()
  public id_usuario: number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_creacion",
  })
  public usuario: HasOne<typeof Usuario>;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;
}
