import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class CampanaResponsable extends BaseModel {
  public static table = "tbl_campana_responsable";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

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
