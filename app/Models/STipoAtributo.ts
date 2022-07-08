import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import STipo from "./STipo";
import SAtributo from "./SAtributo";
import Usuario from "./Usuario";
import { DateTime } from "luxon";

export default class STipoAtributo extends BaseModel {
  public static table = "s_tipo_atributo";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_tipo: number;

  @column()
  public id_atributo: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => STipo, {
    localKey: "id_tipo",
    foreignKey: "id",
  })
  public tipos: HasOne<typeof STipo>;

  @hasOne(() => SAtributo, {
    localKey: "id_atributo",
    foreignKey: "id",
  })
  public atributos: HasOne<typeof SAtributo>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

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
