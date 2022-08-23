import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Diagnostico from "./Diagnostico";
import Recupero from "./Recupero";

export default class RecuperoDiagnostico extends BaseModel {
  public static table = "tbl_recupero_diagnosticos";

  @column({ isPrimary: true })
  public id_recupero_diagnosticos: number;

  @column()
  public id_recupero: number;

  @column()
  public id_diagnostico: number;

  @hasOne(() => Diagnostico, {
    foreignKey: "id",
    localKey: "id_diagnostico",
  })
  public diagnostico: HasOne<typeof Diagnostico>;

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
