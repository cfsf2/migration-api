import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import SConfConfUsuario from "./SConfConfUsuario";
import SConf from "./SConf";

export default class SConfConfDeta extends BaseModel {
  public static table = "s_conf_conf_deta";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_conf_conf_usuario: number;

  @hasOne(() => SConfConfUsuario, {
    foreignKey: "id",
    localKey: "id_conf_conf_usuario",
  })
  public conf_conf_usuario: HasOne<typeof SConfConfUsuario>;

  @column()
  public id_conf: number;

  @hasOne(() => SConf, {
    foreignKey: "id",
    localKey: "id_conf",
  })
  public conf: HasOne<typeof SConf>;

  @column()
  public orden: number;

  @column()
  public mostrar: string;

  @column()
  public default: string;

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
