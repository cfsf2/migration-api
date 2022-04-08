import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Perfil from "./Perfil";

export default class UsuarioPerfil extends BaseModel {
  public static table = "tbl_usuario_perfil";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_usuario: number;

  @column()
  public id_perfil: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  //foreing key
  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario",
  })
  public usuario: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Perfil, {
    foreignKey: "id",
    localKey: "id_perfil",
  })
  public perfil: HasOne<typeof Perfil>;
}
