import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Provincia extends BaseModel {
  public static table = "tbl_provincia";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public centroide_lon: string;

  @column()
  public centroide_lat: string;

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
