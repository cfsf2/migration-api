import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import SConf from "./SConf";
import SConfConfDeta from "./SConfConfDeta";

export default class SConfConfUsuario extends BaseModel {
  public static table = "s_conf_conf_usuario";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_conf: number;

  @hasOne(() => SConf, {
    foreignKey: "id",
    localKey: "id_conf",
  })
  public conf: HasOne<typeof SConf>;

  @column()
  public id_usuario: number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario",
  })
  public usuario: HasOne<typeof Usuario>;

  @column()
  public cantdd_registros: number;

  @column()
  public iniciar_activo: string;

  @column()
  public order: string;

  @column()
  public guardar_filtros: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

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

  @hasMany(() => SConfConfDeta, {
    foreignKey: "id_conf_conf_usuario",
    localKey: "id",
  })
  public detalles: HasMany<typeof SConfConfDeta>;

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
