import { BaseModel, HasOne, column, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Institucion from "./Institucion";
import { DateTime } from "luxon";

export default class UsuarioInstitucion extends BaseModel {
  public static table = "tbl_usuario_institucion";

  @column({ isPrimary: true, serializeAs: "usuario_institucion_id" })
  public id: number;

  @column()
  public id_usuario_modificacion: string;

  @column()
  public id_usuario_creacion: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario: number;

  @column()
  public id_institucion: number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario",
  })
  public usuario: HasOne<typeof Usuario>;

  @hasOne(() => Institucion, {
    foreignKey: "id",
    localKey: "id_institucion",
  })
  public institucion: HasOne<typeof Institucion>;
}
