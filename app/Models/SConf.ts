import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import SConfPermiso from "./SConfPermiso";
import STipo from "./STipo";
import Usuario from "./Usuario";

export default class SConf extends BaseModel {
  public static table = "s_conf";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public permiso: string;

  @column()
  public id_a: string;

  @column()
  public id_tipo: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @belongsTo(() => SConfPermiso, {
    localKey: "id_conf",
    foreignKey: "id",
  })
  public conf_permiso: BelongsTo<typeof SConfPermiso>;

  @hasOne(() => STipo, {
    localKey: "id_tipo",
    foreignKey: "id",
  })
  public tipo: HasOne<typeof STipo>;

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
}
