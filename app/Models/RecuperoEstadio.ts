import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Recupero from "./Recupero";

export default class RecuperoEstadio extends BaseModel {
  public static table = "tbl_recupero_estadio";

  @column({ isPrimary: true })
  public id_recupero_estadio: number;

  @column()
  public id_recupero: number;

  @column()
  public id_estadio: number;

  @hasOne(() => RecuperoEstadio, {
    foreignKey: "id",
    localKey: "id_estadio",
  })
  public estadio: HasOne<typeof RecuperoEstadio>;

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
