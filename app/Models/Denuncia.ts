import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class PedidoProductoPack extends BaseModel {
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

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => DenunciaTipo, {
    foreignKey: "id",
  })
  public id_tipodenuncia: HasOne<typeof DenunciaTipo>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_denunciante: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_denunciado: HasOne<typeof Usuario>;
}
