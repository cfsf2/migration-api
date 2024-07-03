import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Comisionista extends BaseModel {
  public static table = "tbl_comisionista";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
