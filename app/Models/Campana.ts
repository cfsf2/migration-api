import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  HasManyThrough,
  hasManyThrough,
  hasOne,
  HasOne,
  scope,
} from "@ioc:Adonis/Lucid/Orm";
import CampanaResponsable from "./CampanaResponsable";
import Usuario from "./Usuario";
import Database from "@ioc:Adonis/Lucid/Database";
import CampanaAtributo from "./CampanaAtributo";
import CampanaCampanaAtributo from "./CampanaCampanaAtributo";
import CampanaOrientado from "./CampanaOrientado";
import CampanaCampanaOrientado from "./CampanaCampanaOrientado";

export default class Campana extends BaseModel {
  static async traerCampanasActivas() {
    const campanasActivas = await Database.rawQuery(
      `SELECT * FROM tbl_campana AS c WHERE  c.habilitado = "s"`
    );
    return campanasActivas[0];
  }

  public static table = "tbl_campana";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public titulo: string;

  @column()
  public descripcion: string;

  @column()
  public funcion_callback: string;

  @column.dateTime()
  public fecha_inicio: DateTime;

  @column.dateTime()
  public fecha_fin: DateTime;

  @column()
  public url_imagen_banner: string;

  @column()
  public url_imagen_miniatura: string;

  @column()
  public url_imagen_fondo: string;

  @column()
  public url_imagen_principal: string;

  @column()
  public condiciones_terminos: string;

  @column()
  public habilitado: string;

  @column()
  public texto_dinamico: string;

  @column()
  public max_req: number;

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

  @hasOne(() => CampanaResponsable, {
    foreignKey: "id",
  })
  public id_campana_responsable: HasOne<typeof CampanaResponsable>;

  @hasManyThrough([() => CampanaAtributo, () => CampanaCampanaAtributo], {
    localKey: "id",
    foreignKey: "id_campana",
    throughLocalKey: "id_campana_atributo",
    throughForeignKey: "id",
  })
  public atributos: HasManyThrough<typeof CampanaAtributo>;

  @hasManyThrough([() => CampanaOrientado, () => CampanaCampanaOrientado], {
    localKey: "id",
    foreignKey: "id_campana",
    throughLocalKey: "id_campana_orientado",
    throughForeignKey: "id",
  })
  public orientados: HasManyThrough<typeof CampanaOrientado>;
}
