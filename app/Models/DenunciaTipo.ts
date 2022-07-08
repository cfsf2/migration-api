import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class DenunciaTipo extends BaseModel {
  public static table = "tbl_denuncia_tipo";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public id_usuario_creacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

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
