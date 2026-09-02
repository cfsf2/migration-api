import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import SRc from "./SRc";

export default class SRcDeta extends BaseModel {
  public static table = "s_rc_deta";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_rc: number;

  @column()
  public campo: string;

  @column()
  public valor: string;

  @hasOne(() => SRc, {
    foreignKey: "id",
    localKey: "id_rc",
  })
  public SRc: HasOne<typeof SRc>;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

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
