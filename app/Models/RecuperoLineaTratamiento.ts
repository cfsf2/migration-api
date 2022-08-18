import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import LineaTratamiento from "./LineaTratamiento";
import Recupero from "./Recupero";

export default class RecuperoLineaTratamiento extends BaseModel {
  public static table = "tbl_recupero_linea_tratamiento";

  @column({ isPrimary: true })
  public id_recupero_linea_tratamiento: number;

  @column()
  public id_recupero: number;

  @column()
  public id_linea_tratamiento: number;

  @hasOne(() => LineaTratamiento, {
    foreignKey: "id",
    localKey: "id_linea_tratamiento",
  })
  public linea_tratamiento: HasOne<typeof LineaTratamiento>;

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
    return extras;
  }
}
