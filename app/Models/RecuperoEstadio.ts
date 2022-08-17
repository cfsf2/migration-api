import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Estadio from "./Estadio";

export default class RecuperoEstadio extends BaseModel {
  public static table = "tbl_recupero_estadio";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_estadio: number;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @hasOne(() => Estadio, {
    foreignKey: "id",
    localKey: "id_estadio",
  })
  public estadio: HasOne<typeof Estadio>;

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
