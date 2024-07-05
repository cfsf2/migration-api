import { BaseModel, HasOne, column, hasOne } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Usuario from "./Usuario";

export default class Presentacion extends BaseModel {
  public static table = "tbl_presentacion";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public fecha_inicio: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
