import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Usuario from "./Usuario";
import EstadoPedido from "./EstadoPedido";
import Database from "@ioc:Adonis/Lucid/Database";
import PedidoProductoPack from "./PedidoProductoPack";
import Mail from "@ioc:Adonis/Addons/Mail";
import { generarHtml } from "App/Helper/email";
import {
  AccionCRUD,
  boolaEnum,
  enumaBool,
  guardarDatosAuditoria,
} from "App/Helper/funciones";

export default class Pedido extends BaseModel {
  static async traerPedidos({
    usuarioNombre,
    idFarmacia = null,
    idPedido,
  }: {
    usuarioNombre?: string;
    idFarmacia?: number | null;
    idPedido?: number;
  }) {
    const datos = await Database.from("tbl_pedido")
      .select(
        Database.raw(
          `tbl_pedido.*, 
          tbl_pedido.ts_modificacion as fechamodificacion, 
          tbl_pedido.ts_creacion as fechaalta, 
          tbl_pedido.id as _id`
        )
      )
      .leftJoin("tbl_estado_pedido", "id_estado_pedido", "tbl_estado_pedido.id")
      .select("tbl_estado_pedido.nombre as estado")
      .if(usuarioNombre, (query) => {
        return query.where("tbl_pedido.username", usuarioNombre as string);
      })
      .if(idFarmacia, (query) => {
        return query.where("tbl_pedido.id_farmacia", idFarmacia as number);
      })
      .if(idPedido, (query) => {
        return query.where("tbl_pedido.id", idPedido as number);
      });

    const newPedido = await Promise.all(
      datos.map(async (p) => {
        const pedidosSolicitado = await Database.from(
          "tbl_pedido_producto_pack as ppp"
        )
          .select("*")
          .leftJoin("tbl_producto_pack as pp", "ppp.id_productospack", "pp.id")
          .where("ppp.id_pedido", p.id);

        const usuarioCliente = await Usuario.findBy("usuario", p.username);

        if (!usuarioCliente) {
          p.datos_cliente = (await JSON.parse(p.datos_cliente))[0]?.apellido
            ? await JSON.parse(p.datos_cliente)
            : [{ apellido: null }];
        } else {
          p.datos_cliente = [usuarioCliente];
        }

        if (pedidosSolicitado.length === 0) {
          p.gruposproductos = await JSON.parse(p.gruposproductos);
          return p;
        }

        p.gruposproductos = [{ productos: [] }];
        p.gruposproductos[0].productos = pedidosSolicitado;
        p._id = p._id.toString();

        return p;
      })
    );
    // console.log(await newPedido[0])
    return newPedido.map((p) => enumaBool(p));
  }

  static async actualizarPedido({ id, pedidoCambios, auth }) {
    let pedido = await Pedido.findOrFail(id);

    const estado = await EstadoPedido.query()
      .where("nombre", pedidoCambios.estado)
      .select("id");

    const gruposproductos = pedidoCambios.gruposproductos;

    gruposproductos[0].datos_cliente = { email: pedidoCambios.username };

    pedido.gruposproductos = JSON.stringify(gruposproductos);
    pedido.datos_cliente = JSON.stringify({ email: pedidoCambios.username });
    pedido.id_estado_pedido = estado[0].id;
    pedido.comentarios = pedidoCambios.comentarios;
    pedido.domicilioenvio = pedidoCambios.domicilioenvio;
    pedido.pago_online = boolaEnum(pedidoCambios.pago_online);
    pedido.envio = boolaEnum(pedidoCambios.envio);
    pedido.total = pedidoCambios.gruposproductos[0].precio
      ? Number(pedidoCambios.gruposproductos[0].precio)
      : null;

    guardarDatosAuditoria({
      objeto: pedido,
      usuario: auth,
      accion: AccionCRUD.editar,
    });
    return pedido.save();
  }

  static async guardarPedido({ pedidoWeb }) {
    const pedido = new Pedido();

    const farmacia = await Database.rawQuery(
      "select id, id_usuario from tbl_farmacia where nombre = ?",
      [pedidoWeb.nombrefarmacia]
    );

    pedido.id_estado_pedido = 1;
    pedido.id_farmacia = pedidoWeb.idFarmacia
      ? pedidoWeb.idFarmacia
      : pedidoWeb.nombrefarmacia
      ? farmacia[0][0].id
      : null;
    pedido.id_socio = pedidoWeb.idsocio;
    pedido.id_usuario_creacion = pedidoWeb.idsocio;
    pedido.id_usuario_modificacion = pedidoWeb.idsocio;
    pedido.nombrefarmacia = pedidoWeb.nombrefarmacia;
    pedido.descripcion = pedidoWeb.descripcion;
    pedido.comentarios = pedidoWeb.comentarios;
    pedido.costoenvio = pedidoWeb.costoenvio;

    pedido.envio = pedidoWeb.envio === "true" ? "s" : "n";
    pedido.domicilioenvio = pedidoWeb.domicilioenvio;
    pedido.gruposproductos = JSON.stringify(pedidoWeb.gruposproductos[0]);
    pedido.pago_online = pedidoWeb.pago_online ? "s" : "n";
    pedido.es_invitado = pedidoWeb.es_invitado ? "s" : "n";
    pedido.whatsapp = pedidoWeb.whatsapp;
    pedido.datos_cliente = pedidoWeb.datos_cliente
      ? JSON.stringify(pedidoWeb.datos_cliente[0])
      : "";
    pedido.origen = pedidoWeb.origen;
    pedido.username = pedidoWeb.username;
    pedido.obra_social = pedidoWeb.obra_social;
    pedido.obra_social_dorso = pedidoWeb.obra_social_dorso;
    pedido.obra_social_frente = pedidoWeb.obra_social_frente;
    pedido.receta = pedidoWeb.gruposproductos[0].receta;
    pedido.total = pedidoWeb.gruposproductos[0].productos
      ? pedidoWeb.gruposproductos[0].productos.reduce(
          (
            subtotal: number,
            p: { cantidad: number; precio: any }
            //i: number
          ) => {
            subtotal = subtotal + Math.round(p.cantidad) * Number(p.precio);
            return subtotal;
          },
          0
        )
      : null;

    await pedido.save();

    if (pedidoWeb.gruposproductos[0].productos) {
      pedidoWeb.gruposproductos[0].productos.forEach(
        async (p: {
          entidad: string;
          idProducto: number;
          cantidad: number;
          precio: number;
        }) => {
          const pedidoProducto = new PedidoProductoPack();
          pedidoProducto.id_pedido = pedido.id;
          if (p.entidad === "productopropio") {
            pedidoProducto.id_producto_custom = p.idProducto;
          } else {
            pedidoProducto.id_productospack = p.idProducto;
          }
          pedidoProducto.cantidad = p.cantidad;
          pedidoProducto.precio = p.precio;
          pedidoProducto.subtotal = Math.round(p.cantidad) * Number(p.precio);

          if (pedido.id_socio) {
            pedidoProducto.id_usuario_creacion = Number(pedido.id_socio);
            pedidoProducto.id_usuario_modificacion = Number(pedido.id_socio);
          }

          await pedidoProducto.save();
        }
      );
    }
    pedidoWeb;
    Mail.send((message) => {
      message
        .from("farmageoapp@gmail.com")
        .to(pedidoWeb.destinatario)
        .subject(pedidoWeb.asunto)
        .html(
          generarHtml({
            titulo: "Nuevo Pedido",
            texto: pedidoWeb.html.concat(`
             ${pedidoWeb.gruposproductos[0].productos.map((p) => {
               return (
                 "<p>" +
                 p.nombre +
                 " |    cantidad: " +
                 p.cantidad +
                 " |    precio unitario: " +
                 p.precio +
                 "</p></br>"
               );
             })}
        <p>Total: ${pedido.total}</p>`),
          })
        );
    });
    return pedido;
  }
  public static table = "tbl_pedido";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public descripcion: string;

  @column()
  public comentarios: string;

  @column()
  public costoenvio: string;

  @column()
  public domicilioenvio: string;

  @column()
  public gruposproductos: string;

  @column()
  public pago_online: string;

  @column()
  public envio: string;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public fechaentrega: DateTime;

  @column()
  public es_invitado: string;

  @column()
  public id_socio: string;

  @column()
  public datos_cliente: string;

  @column()
  public origen: string;

  @column()
  public username: string;

  @column()
  public nombrefarmacia: string;

  @column()
  public whatsapp: string;

  @column()
  public obra_social: string;

  @column()
  public obra_social_frente: string;

  @column()
  public obra_social_dorso: string;

  @column()
  public receta: string;

  @column()
  public total: number | null;

  @column()
  public id_farmacia: number;

  @column()
  public id_estado_pedido: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key

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

  @hasOne(() => Farmacia, {
    foreignKey: "id",
    localKey: "id_farmacia",
  })
  public farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => EstadoPedido, {
    foreignKey: "id",
    localKey: "id_estado_pedido",
  })
  public estado_pedido: HasOne<typeof EstadoPedido>;

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
