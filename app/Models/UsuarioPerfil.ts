import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class UsuarioPerfil extends BaseModel {
  public static table = "tbl_usuario_perfil";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_usuario: number;

  @column()
  public id_perfil: number;

  @column()
  public id_usuario_creacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_perfil_id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_perfil_id_usuario: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_perfil_id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Perfil, {
    foreignKey: "id",
  })
  public usuario_perfil_id_perfil: HasOne<typeof Perfil>;
}
