import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class LineaTratamiento extends BaseModel {
  public static table = "tbl_linea_tratamiento";

  @column({ isPrimary: true })
  public id_linea_tratamiento: number;

  @column()
  public nombre: string;

  @column()
  public orden: number;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      if (k === "_id") return (extras[k] = this.$extras[k].toString());
      extras[k] = this.$extras[k];
    });
    extras["id"] = this.$primaryKeyValue;
    return extras;
  }
}
