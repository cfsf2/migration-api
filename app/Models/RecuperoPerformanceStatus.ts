import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import PerformanceStatus from "./PerformanceStatus";
import Recupero from "./Recupero";

export default class RecuperoPerformanceStatus extends BaseModel {
  public static table = "tbl_recupero_performance_status";

  @column({ isPrimary: true })
  public id_recupero_performance_status: number;

  @column()
  public id_recupero: number;

  @column()
  public id_performance_status: number;

  @hasOne(() => PerformanceStatus, {
    foreignKey: "id",
    localKey: "id_performance_status",
  })
  public performance_status: HasOne<typeof PerformanceStatus>;

  @belongsTo(() => Recupero, {
    foreignKey: "id_recupero",
    localKey: "id",
  })
  public Recupero: BelongsTo<typeof Recupero>;

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
