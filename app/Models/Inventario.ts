import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class Inventario extends BaseModel {
  public static table = "tbl_inventario";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

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
