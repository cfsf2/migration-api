import { DateTime } from "luxon";
import {
  BaseModel,
  column,
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
import Database from "@ioc:Adonis/Lucid/Database";

export default class Publicidad extends BaseModel {
  static async traerPublicidades() {
    const resultado = await Database.from("tbl_publicidad as p")
      .select(
        //"p.*",
        "p.id",
        "p.titulo",
        "p.descripcion",
        "p.link",
        "p.habilitado",
        "p.imagen",
        "p.fecha_inicio",
        "p.fecha_fin",
        "p.ts_creacion as fechaalta",
        "tp.nombre as tipo",
        "cp.nombre as color",
        Database.raw("GROUP_CONCAT(i.id) as instituciones")
      )
      .leftJoin(
        "tbl_publicidad_tipo as tp",
        "tp.id",
        "=",
        "p.id_publicidad_tipo"
      )
      .leftJoin("tbl_publicidad_color as cp", "cp.id", "=", "p.id_color")
      .leftJoin(
        "tbl_publicidad_institucion as ip",
        "ip.id_publicidad",
        "=",
        "p.id"
      )
      .leftJoin("tbl_institucion as i", "ip.id_institucion", "=", "i.id")
      .groupBy("p.id")
      .orderBy("p.ts_creacion", "desc");

    function arrayzar(modelo, key) {
      modelo[key] = modelo[key] ? modelo[key].split(",") : modelo;

      let res = modelo;

      return res;
    }

    const formateo = resultado.map((e) => {
      const claves = Object.keys(e);
      claves.forEach((k) => {
        if (e[k] === "s") {
          e[k] = true;
        }
        if (e[k] === "n") {
          e[k] = false;
        }
      });

      return e;
    });

    const result = formateo.map((r) => arrayzar(r, "instituciones"));

    return result;
  }
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

  @column()
  public id_publicidad_color: Number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

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

  @hasOne(() => PublicidadTipo, {
    foreignKey: "id",
    localKey: "id_publicidad_tipo",
  })
  public juancito: HasOne<typeof PublicidadTipo>;

  @hasOne(() => PublicidadColor, {
    foreignKey: "id",
    localKey: "id_publicidad_color",
  })
  public color: HasOne<typeof PublicidadColor>;

  @hasManyThrough([() => Institucion, () => PublicidadInstitucion], {
    localKey: "id", // tbl_publicidad
    foreignKey: "id_publicidad", // tbl_publicidad_institucion
    throughLocalKey: "id_institucion", // tbl_publicidad_institucion
    throughForeignKey: "id", // tbl_institucion
    // serializeAs: "Instituciones",
  })
  public instituciones: HasManyThrough<typeof Institucion>;
}
