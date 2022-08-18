import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Diagnostico extends BaseModel {
  public static table = "diagnosticos";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public codigo: string;

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
