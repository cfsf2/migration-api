import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class Institucion extends BaseModel {
  public static table = "tbl_institucion";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  // @column({ columnName: "id" })
  // public _id: number;

  @column()
  public habilitado: string;

  @column()
  public id_institucion_madre?: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @belongsTo(() => Institucion, {
    foreignKey: "id_institucion_madre",
    localKey: "id",
    serializeAs: "id_institucion_madre",
  })
  public institucion_madre: BelongsTo<typeof Institucion>;

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
    extras["_id"] = this.id;
    return extras;
  }
}
