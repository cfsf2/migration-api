import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class Permiso extends BaseModel {
  public static table = "tbl_permiso";

  @column({ isPrimary: true })
  public id: number;

  @column({ serializeAs: "slug" })
  public nombre: string;

  @column()
  public descripcion: string;

  @column()
  public tipo: string;

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
    return {
      _id: this.$extras._id?.toString(),
    };
  }
}
