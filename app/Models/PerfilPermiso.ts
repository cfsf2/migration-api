import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Perfil from "./Perfil";
import Usuario from "./Usuario";
import Permiso from "./Permiso";

export default class PerfilPermiso extends BaseModel {
  public static table = "tbl_perfil_permiso";

  @column({ isPrimary: true })
  public id: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_perfil: number;
  @column()
  public id_permiso: number;

  @hasOne(() => Perfil, {
    foreignKey: "id",
    localKey: "id_perfil",
  })
  public perfil: HasOne<typeof Perfil>;

  @column()
  public id_usuario_creacion: number;
  @column()
  public id_usuario_modificacion: number;

  @hasOne(() => Permiso, {
    foreignKey: "id",
    localKey: "id_permiso",
  })
  public permiso: HasOne<typeof Permiso>;

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
