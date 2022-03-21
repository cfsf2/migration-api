import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  hasMany,
  HasMany,
  hasManyThrough,
  HasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import PublicidadColor from "./PublicidadColor";
import PublicidadTipo from "./PublicidadTipo";
import Institucion from "./Institucion";
import PublicidadInstitucion from "./PublicidadInstitucion";

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

  @column()
  public id_publicidad_tipo: Number;

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
    localKey: "id_publicidad_tipo",
  })
  public tipo: HasOne<typeof PublicidadTipo>;

  @hasOne(() => PublicidadColor, {
    foreignKey: "id",
  })
  public color: HasOne<typeof PublicidadColor>;

  @hasManyThrough([() => Institucion, () => PublicidadInstitucion], {
    foreignKey: "id_publicidad",
    localKey: "id",
    throughForeignKey: "id",
    throughLocalKey: "id_institucion",
    serializeAs: "Institucion_",
  })
  public instituciones: HasManyThrough<typeof Institucion>;
}
