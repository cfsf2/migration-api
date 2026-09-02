import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class SRc extends BaseModel {
  public static table = "s_rc";

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

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      if (k === "_id") return (extras[k] = this.$extras[k].toString());
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
