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

  @hasOne(() => Perfil, {
    foreignKey: "id",
  })
  public id_perfil: HasOne<typeof Perfil>;

  @hasOne(() => Permiso, {
    foreignKey: "id",
  })
  public id_permiso: HasOne<typeof Permiso>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;
}
