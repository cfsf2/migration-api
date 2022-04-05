import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
  HasManyThrough,
  hasManyThrough,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";

import Farmacia from "./Farmacia";
import Usuario from "./Usuario";
import Campana from "./Campana";
import CampanaAtributo from "./CampanaAtributo";
import CampanaCampanaAtributo from "./CampanaCampanaAtributo";
import Database from "@ioc:Adonis/Lucid/Database";

enum bool {
  n = "n",
  s = "s",
}

export default class CampanaRequerimiento extends BaseModel {
  public static table = "tbl_campana_requerimiento";

  public static async traerRequerimientos({
    id_campana,
    id_usuario,
    finalizado,
  }: {
    id_campana?: number | string;
    id_usuario?: number;
    finalizado?: bool | string;
  }) {
    const requerimientos = await Database.from(
      "tbl_campana_requerimiento as cr"
    )
      .select(
        "cr.id",
        "cr.id as _id",
        "u.apellido",
        "u.nombre",
        "cr.id_campana as campana_id",
        "c.nombre as campana_nombre",
        "u.id as usuario_id",
        "cr.celular",
        "cr.codigo_promo",
        "cr.finalizado",
        "cr.ts_creacion as fecha_creacion"
      )
      .leftJoin("tbl_usuario as u", "cr.id_usuario", "u.id")
      .leftJoin("tbl_campana as c", "cr.id_campana", "c.id")
      .if(id_usuario, (query) => {
        return query.where("u.id", id_usuario);
      })
      .if(id_campana && id_campana !== "todas", (query) => {
        return query.where("c.id", id_campana);
      })
      .if(finalizado && finalizado !== "todas", (query) => {
        return query.where("cr.finalizado", finalizado);
      });

    let req = requerimientos.map(async (r) => {
      const atributos = await Database.from(
        "tbl_campana_campana_atributo as cca"
      )
        .select(
          "cca.valor",
          "cca.sql",
          "ca.nombre",
          "ca.descripcion",
          "ca.codigo",
          "ca.id as id_atributo"
        )
        .where("cca.id_campana", r.campana_id)
        .leftJoin(
          "tbl_campana_atributo as ca",
          "cca.id_campana_atributo",
          "ca.id"
        );

      r.atributos = atributos;
      r.usuario_nombre = r.apellido ? r.nombre + " " + r.apellido : r.nombre;

      return r;
    });

    return Promise.all(req);
  }

  @column({ isPrimary: true })
  public id: number;

  @column()
  public finalizado: string;

  @column()
  public celular: string;

  @column()
  public codigo_promo: string;

  @column()
  public texto_mensaje: string;

  @column()
  public id_campana: number;

  @column()
  public id_usuario: number;

  @column()
  public id_farmacia: number;

  @column()
  public id_usuario_creacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => Campana, {
    foreignKey: "id",
    localKey: "id_campana",
  })
  public campana: HasOne<typeof Campana>;

  @belongsTo(() => Usuario, {
    foreignKey: "id_usuario",
    localKey: "id",
  })
  public usuario: BelongsTo<typeof Usuario>;

  @belongsTo(() => Farmacia, {
    foreignKey: "id_farmacia",
    localKey: "id",
  })
  public farmacia: BelongsTo<typeof Farmacia>;

  @hasManyThrough([() => CampanaAtributo, () => CampanaCampanaAtributo], {
    localKey: "id_campana",
    foreignKey: "id_campana",
    throughLocalKey: "id_campana_atributo",
    throughForeignKey: "id",
    serializeAs: "atributos",
  })
  public atributos: HasManyThrough<typeof CampanaAtributo>;

  @hasMany(() => CampanaCampanaAtributo, {
    localKey: "id_campana",
    foreignKey: "id_campana",
    serializeAs: "atributos",
  })
  public valor: HasMany<typeof CampanaCampanaAtributo>;
}
