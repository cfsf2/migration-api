import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Usuario from "./Usuario";
import EstadoPedido from "./EstadoPedido";
import Database from "@ioc:Adonis/Lucid/Database";
import PedidoProductoPack from "./PedidoProductoPack";

export default class Pedido extends BaseModel {
  static async traerPedidos({ usuarioNombre }: { usuarioNombre: String }) {
    const datos = await Database.from("tbl_pedido")
      .select(Database.raw(`*, ts_modificacion as fechamodificacion`))
      .where("username", usuarioNombre.toString());

    const arrNuevo = datos.map((e) => {
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

    return arrNuevo;
  }

  static async guardarPedido({ pedidoWeb }) {
    const pedido = new Pedido();

    const farmacia = await Database.rawQuery(
      "select id, id_usuario from tbl_farmacia where nombre = ?",
      [pedidoWeb.nombrefarmacia]
    );

    pedido.id_estado_pedido = 1;
    pedido.id_farmacia = farmacia[0][0].id;
    pedido.id_socio = pedidoWeb.idsocio;
    pedido.id_usuario_creacion = pedidoWeb.idsocio;
    pedido.id_usuario_modificacion = pedidoWeb.idsocio;
    pedido.nombrefarmacia = pedidoWeb.nombrefarmacia;
    pedido.descripcion = pedidoWeb.descripcion;
    pedido.comentario = pedidoWeb.comentarios;
    pedido.costoenvio = pedidoWeb.costoenvio;

    pedido.envio = pedidoWeb.envio === "true" ? "s" : "n";
    pedido.domicilioenvio = pedidoWeb.domicilioenvio;
    pedido.gruposproductos = JSON.stringify(pedidoWeb.gruposproductos[0]);
    pedido.pago_online = pedidoWeb.pago_online ? "s" : "n";
    pedido.es_invitado = pedidoWeb.es_invitado ? "s" : "n";
    pedido.whatsapp = pedidoWeb.whatsapp;
    pedido.datos_cliente = JSON.stringify(pedidoWeb.datos_cliente[0]);
    pedido.origen = pedidoWeb.origen;
    pedido.username = pedidoWeb.username;
    pedido.obra_social = pedidoWeb.obra_social;
    pedido.obra_social_dorso = pedidoWeb.obra_social_dorso;
    pedido.obra_social_frente = pedidoWeb.obra_social_frente;
    pedido.receta = pedidoWeb.receta;
    pedido.total = pedidoWeb.gruposproductos[0].productos.reduce(
      (total, p, i, v) => {
        if (i === 1) total = 0;
        const subtotal =
          Number(total) + Math.round(p.cantidad) * Number(p.precio);
        return subtotal;
      }
    );

    await pedido.save();

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

    console.log("pedidoWeb", pedidoWeb);
    return pedido;
  }
  public static table = "tbl_pedido";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public descripcion: string;

  @column()
  public comentario: string;

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
  public total: number;

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
}
