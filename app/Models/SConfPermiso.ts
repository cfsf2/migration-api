import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import SConf from "./SConf";
import Permiso from "./Permiso";
import { DateTime } from "luxon";
import Usuario from "./Usuario";

export default class SConfPermiso extends BaseModel {
  public static table = "s_conf_permiso";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_conf: number;

  @column()
  public id_permiso: number;

  @column()
  public ver: string;

  @column()
  public alta: string;

  @column()
  public baja: string;

  @column()
  public modificar: string;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

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

  @hasOne(() => SConf, {
    localKey: "id_conf",
    foreignKey: "id",
  })
  public conf: HasOne<typeof SConf>;

  @hasOne(() => Permiso, {
    localKey: "id_permiso",
    foreignKey: "id",
  })
  public permiso: HasOne<typeof Permiso>;
}
