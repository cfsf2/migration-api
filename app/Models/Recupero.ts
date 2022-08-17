import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Monodro from "./Monodro";

export default class Recupero extends BaseModel {
  public static table = "tbl_recupero";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_monodroga: number;

  @column()
  public nombre: string;

  @column()
  public fundamentos_tecnicos: string;

  @column()
  public porcentaje_recupero: number;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(()=> Monodro, {
    foreignKey: "id",
    localKey: "id_monodroga"
  })
  public monodroga: HasOne<typeof Monodro>

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
