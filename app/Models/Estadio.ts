import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Estadio extends BaseModel {
  public static table = "tbl_estadio";

  @column({ isPrimary: true })
  public id_estadio: number;

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
