import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import PublicidadColor from "./PublicidadColor";
import PublicidadTipo from "./PublicidadTipo";

export default class Publicidad extends BaseModel {
  public static table = "tbl_publicidad";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public titulo: string;

  @column()
  public descripcion: string;

  @column()
  public link: string;

  @column()
  public imagen: string;

  @column.dateTime()
  public fecha_inicio: DateTime;

  @column.dateTime()
  public fecha_fin: DateTime;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => PublicidadTipo, {
    foreignKey: "id",
  })
  public id_publicidad_tipo: HasOne<typeof PublicidadTipo>;

  @hasOne(() => PublicidadColor, {
    foreignKey: "id",
  })
  public id_color: HasOne<typeof PublicidadColor>;
}
