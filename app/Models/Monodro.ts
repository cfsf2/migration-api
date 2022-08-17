import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Monodro extends BaseModel {
  public static table = "monodro";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public codigo: number;

  @column()
  public descripcion: string;

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime;

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
