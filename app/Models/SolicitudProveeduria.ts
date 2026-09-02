import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  HasManyThrough,
  hasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Usuario from "./Usuario";
import Entidad from "./Entidad";
import Database from "@ioc:Adonis/Lucid/Database";
import ProductoPack from "./ProductoPack";
import SolicitudProveeduriaProductoPack from "./SolicitudProveeduriaProductoPack";

import { guardarDatosAuditoria, AccionCRUD } from "App/Helper/funciones";
import Mail from "@ioc:Adonis/Addons/Mail";
import { generarHtml } from "App/Helper/email";

export default class SolicitudProveeduria extends BaseModel {
  static async traerSolicitudesProveeduria({
    farmaciaid,
  }: {
    farmaciaid?: number;
  }) {
    const solicitudes = await Database.from("tbl_solicitud_proveeduria as sp")
      .select(
        "sp.*",
        "sp.id as id",
        "sp.id as codigo_solicitud",
        "f.nombre as farmacia_nombre",
        "ep.nombre as estado",
        "e.nombre as entidad_id",
        "sp.id_farmacia as farmacia_id"
      )
      .leftJoin("tbl_farmacia as f", "sp.id_farmacia", "f.id")
      .leftJoin("tbl_estado_pedido as ep", "sp.id_estado_pedido", "ep.id")
      .leftJoin("tbl_entidad as e", "sp.id_entidad", "e.id")
      .if(farmaciaid, (query) =>
        query.where("sp.id_farmacia", farmaciaid as number)
      )
      .orderBy("fecha", "desc");

    const arraySolicitudes = await Promise.all(
      solicitudes.map(async (solicitud) => {
        const productosSolicitados = await Database.from(
          "tbl_solicitud_proveeduria_producto_pack as sppp"
        )
          .select("*")
          .leftJoin("tbl_producto_pack as pp", "sppp.id_producto_pack", "pp.id")
          .where("sppp.id_solicitud_proveeduria", solicitud.id);

        if (productosSolicitados.length === 0) {
          solicitud.productos_solicitados = await JSON.parse(
            solicitud.productos_solicitados
          );
          return solicitud;
        }
        solicitud.productos_solicitados = productosSolicitados;
        return solicitud;
      })
    );
    return arraySolicitudes;
  }

  static async crearSolicitud({ data, usuario }) {
    const nuevaSolicitud = new SolicitudProveeduria();

    const entidad = await Entidad.findByOrFail("nombre", data.entidad_id);

    nuevaSolicitud.merge({
      email_destinatario: data.email_destinatario,
      id_entidad: entidad.id,
      id_estado_pedido: 1,
      id_farmacia: data.farmacia_id,
      nro_cuenta_drogueria: data.nro_cuenta_drogueria,
      fecha: data.fecha,
      productos_solicitados: JSON.stringify(data.productos_solicitados),
    });

    guardarDatosAuditoria({
      objeto: nuevaSolicitud,
      usuario: usuario,
      accion: AccionCRUD.crear,
    });

    try {
      await nuevaSolicitud.save();
      //const arrayDestinatarios = data.destinatario.split(";");

      const arr = "rodriad90@gmail.com;rodrigoa.acevedo@mgmail.com".split(";");
      // console.log(arr);
      arr.forEach((destinatario) => {
        Mail.send((messege) => {
          messege
            .from(process.env.SMTP_USERNAME as string)
            // .to(data.email_destinatario)
            .to(destinatario)
            .subject(data.asunto)
            .html(
              generarHtml({
                titulo: data.asunto,
                texto: data.html,
              })
            );
        });
      });

      data.productos_solicitados.forEach((item) => {
        const solicitudProducto = new SolicitudProveeduriaProductoPack();
        solicitudProducto.merge({
          id_solicitud_proveeduria: nuevaSolicitud.id,
          id_producto_pack: item._id,
          cantidad: item.cantidad,
        });
        solicitudProducto.save();
      });
      return nuevaSolicitud;
    } catch (error) {
      return error;
    }
  }

  public static table = "tbl_solicitud_proveeduria";

  @column({ isPrimary: true })
  public id: number;

  @column.dateTime({ autoCreate: true })
  public fecha: DateTime;

  @column()
  public nro_cuenta_drogueria: string;

  @column()
  public email_destinatario: string;

  @column()
  public productos_solicitados: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_entidad: number;

  @column()
  public id_farmacia: number;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_estado_pedido: number;

  //foreing key
  @hasOne(() => Entidad, {
    foreignKey: "id",
    localKey: "id_entidad",
  })
  public entidad: HasOne<typeof Entidad>;

  @hasOne(() => Farmacia, {
    foreignKey: "id",
    localKey: "id_farmacia",
  })
  public farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasManyThrough(
    [() => ProductoPack, () => SolicitudProveeduriaProductoPack],
    {
      localKey: "id",
      foreignKey: "id_solicitud_proveeduria",

      throughLocalKey: "id_producto_pack",
      throughForeignKey: "id",
    }
  )
  public producto: HasManyThrough<typeof ProductoPack>;

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
