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
import { enumaBool } from "App/Helper/funciones";

export default class Publicidad extends BaseModel {
  static async traerPublicidades({
    tipo,
    habilitado,
    institucion,
    titulo,
    vigencia,
  }: {
    tipo?: string;
    habilitado?: string;
    institucion?: string;
    titulo?: string;
    vigencia?: string;
    username?: string;
  }) {
    const publicidades = await Database.from("tbl_publicidad as p")
      .select(
        //"p.*",
        "p.id",
        "p.id as _id",
        "p.titulo",
        "p.descripcion",
        "p.link",
        "p.habilitado",
        "p.imagen",
        "p.fecha_inicio as fechainicio",
        "p.fecha_fin as fechafin",
        "p.ts_creacion as fecha_alta",
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
      .orderBy("fecha_alta", "desc")

      //novedades admin
      .if(tipo, (query) => {
        query.where("tp.nombre", "novedadesadmin");
      })

      //novedades search
      .if(habilitado === "true" || habilitado === "false", (query) => {
        const condicional = habilitado === "true" ? "s" : "n";
        query.andWhere("p.habilitado", condicional);
      })

      .if(institucion && institucion !== "todas", (query) => {
        query.andWhere("i.id", institucion);
      })

      .if(titulo && titulo.trim() !== "", (query) => {
        query.andWhere("titulo", "LIKE", `${titulo}%`);
      })

      .if(vigencia && vigencia !== "todas", (query) => {
        const hoy = DateTime.now().setLocale("es-Ar").toISO();
        query
          .if(vigencia === "true", (query) => {
            //console.log("fecha de", hoy);
            query
              .where("fecha_inicio", "<=", hoy)
              .where("fecha_fin", ">=", hoy);
          })

          .if(vigencia === "false", (query) =>
            query.andWhere((query) =>
              query
                .orWhere("fecha_inicio", ">", hoy)
                .orWhere("fecha_fin", "<", hoy)
            )
          );
      });

    function arrayzar(modelo, key) {
      modelo[key] = modelo[key] ? modelo[key].split(",") : [];

      let res = modelo;

      return res;
    }

    let result = publicidades.map((r) => arrayzar(r, "instituciones"));
    result = result.map((p) => enumaBool(p));

    return result;
  }

  static async traerNovedadesFarmacias({
    id_farmacia,
  }: {
    id_farmacia: string;
  }) {
    const publicidades = await Database.from("tbl_publicidad as p")
      .select("p.*", "p.ts_creacion as fecha_alta", "pc.nombre as color")
      .leftJoin("tbl_publicidad_institucion as pi", "p.id", "pi.id_publicidad")
      .leftJoin(
        "tbl_farmacia_institucion as fi",
        "pi.id_institucion",
        "fi.id_institucion"
      )
      .leftJoin("tbl_farmacia as f", "fi.id_farmacia", "f.id")
      .leftJoin("tbl_publicidad_color as pc", "p.id_color", "pc.id")
      .where("f.id", id_farmacia)
      .where("p.id_publicidad_tipo", 1)
      .orderBy("fecha_alta", "desc");

    return publicidades;
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
  public id_publicidad_tipo: number;

  @column()
  public id_color: number;

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

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      if (k === "_id") return (extras[k] = this.$extras[k].toString());
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
