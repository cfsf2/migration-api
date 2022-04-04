import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import DenunciaTipo from "./DenunciaTipo";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Denuncia extends BaseModel {
  static async traerDenuncias() {
    const datos = await Database.from("tbl_denuncia")
    .select("*");
    
    return datos;
  }
  public static table = "tbl_denuncia";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public motivo: string;

  @column()
  public nombre_denunciado: string;

  @column()
  public id_denuncia_tipo: number;

  @column.dateTime()
  public fecha: DateTime;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_denunciante: number;

  @column()
  public id_usuario_denunciado: number;

  @column()
  public id_tipodenuncia: number;

  @hasOne(() => DenunciaTipo, {
    foreignKey: "id",
    localKey: "id_denuncia_tipo",
  })
  public tipodenuncia: HasOne<typeof DenunciaTipo>;

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

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_denunciante",
  })
  public usuario_denunciante: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_denunciado",
  })
  public usuario_denunciado: HasOne<typeof Usuario>;
}
