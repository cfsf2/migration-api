import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Diagnostico from "./Diagnostico";

export default class RecuperoDiagnostico extends BaseModel {
  public static table = "tbl_recupero_dignosticos";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_diagnostico: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasOne(() => Diagnostico, {
    foreignKey: "id",
    localKey: "id_diagnostico",
  })
  public diagnostico: HasOne<typeof Diagnostico>;

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
