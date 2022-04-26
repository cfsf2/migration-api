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
import Farmacia from "./Farmacia";
import Drogueria from "./Drogueria";
import EstadoTransfer from "./EstadoTransfer";
import Laboratorio from "./Laboratorio";
import Database from "@ioc:Adonis/Lucid/Database";
import TransferProducto from "./TransferProducto";
import TransferTransferProducto from "./TransferTransferProducto";

import { transferHtml } from "../Helper/email";
import { AccionCRUD, guardarDatosAuditoria } from "../Helper/funciones";
import Mail from "@ioc:Adonis/Addons/Mail";

export default class Transfer extends BaseModel {
  static async traerTransfers({ id_farmacia }: { id_farmacia?: number }) {
    const transfers = await Database.from("tbl_transfer as t")
      .select(
        "t.*",
        "t.id as _id",
        "t.ts_modificacion as fecha_modificacion",
        "t.ts_creacion as fecha_alta",
        "d.nombre as drogueria_id",
        "f.matricula as farmacia_id",
        "f.nombre as farmacia_nombre",
        "f.id as id_farmacia",
        "et.nombre as estado",
        "u.id_usuario_creacion as id_usuario_creacion",
        "u.id_usuario_modificacion as ultima_modificacion"
      )
      .leftJoin("tbl_drogueria as d", "t.id_drogueria", "d.id")
      .leftJoin("tbl_farmacia as f", "t.id_farmacia", "f.id")
      .leftJoin("tbl_estado_transfer as et", "t.id_transfer_estado", "et.id")
      .leftJoin("tbl_usuario as u", "t.id", "u.id")
      .if(id_farmacia, (query) => {
        console.log(id_farmacia);
        query.where("t.id_farmacia", id_farmacia);
      })
      .orderBy("fecha_alta", "desc");

    const res = await Promise.all(
      transfers.map(async (t) => {
        const productos = await Database.query()
          .select("tp.*", " ttp.cantidad", "ttp.observaciones")
          .from("tbl_transfer_transfer_producto as ttp")
          .leftJoin(
            "tbl_transfer_producto as tp",
            "ttp.id_transfer_producto",
            "tp.id"
          )
          .where("ttp.id_transfer", t.id);

        t.productos_solicitados = productos;
        if (productos.length === 0) {
          t.productos_solicitados = JSON.parse(t.productos_solicitados);
        }
        return t;
      })
    );

    return res;
  }

  static async guardar({ data, usuario }: { data: any; usuario: any }) {
    const nuevoTransfer = new Transfer();
    const drogueria = await Drogueria.findByOrFail("nombre", data.drogueria_id);
    const laboratorio = await Laboratorio.findByOrFail(
      "nombre",
      data.laboratorio_id
    );
    const farmacia = await Farmacia.findByOrFail("id_usuario", usuario.id);

    nuevoTransfer.merge({
      nro_cuenta_drogueria: data.nro_cuenta_drogueria,
      id_drogueria: drogueria.id,
      id_laboratorio: laboratorio.id,
      id_transfer_estado: 1,
      id_farmacia: farmacia.id,
      fecha: DateTime.now(),
      email_destinatario: farmacia.email ? farmacia.email : usuario.email,
      productos_solicitados: JSON.stringify(data.productos_solicitados),

      id_usuario_creacion: usuario.id, // cambiar por dato de sesion
    });

    guardarDatosAuditoria({
      objeto: nuevoTransfer,
      usuario: usuario,
      accion: AccionCRUD.crear,
    });

    await nuevoTransfer.save();

    data.productos_solicitados.forEach((p) => {
      const transferProducto = new TransferTransferProducto();
      transferProducto.merge({
        id_transfer_producto: p.id,
        id_transfer: nuevoTransfer.id,
        cantidad: p.cantidad,
        precio: p.precio,
        observaciones: p.observacion,

        id_usuario_creacion: usuario.id, // cambiar por dato de sesion
      });
      transferProducto.save();
    });

    Mail.send((message) => {
      message
        .from(process.env.SMTP_USERNAME)
        //.to(process.env.TRANSFER_EMAIL)
        .to(farmacia.email)
        .to(process.env.TRANSFER_EMAIL)
        .subject("Confirmacion de pedido de Transfer" + " " + nuevoTransfer.id)
        .html(transferHtml({ transfer: data, farmacia: farmacia }));
    });
  }
  public static table = "tbl_transfer";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_drogueria: number;

  @column()
  public id_laboratorio: number;

  @column()
  public id_farmacia: number;

  @column()
  public matricula: number;

  @column.dateTime({ autoCreate: true })
  public fecha: DateTime;

  @column()
  public id_transfer_estado: number;

  @column()
  public nro_cuenta_drogueria: string;

  @column()
  public email_destinatario: string;

  @column()
  public productos_solicitados: string;

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

  @hasOne(() => Drogueria, {
    foreignKey: "id",
    localKey: "id_drogueria",
  })
  public drogueria: HasOne<typeof Drogueria>;

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
    localKey: "id_laboratorio",
  })
  public laboratorio: HasOne<typeof Laboratorio>;

  @hasOne(() => EstadoTransfer, {
    foreignKey: "id",
    localKey: "id_estado_transfer",
  })
  public estado_transfer: HasOne<typeof EstadoTransfer>;

  @hasManyThrough([() => TransferProducto, () => TransferTransferProducto], {
    localKey: "id",
    foreignKey: "id_transfer",
    throughLocalKey: "id_transfer_producto",
    throughForeignKey: "id",
  })
  public productos: HasManyThrough<typeof TransferProducto>;

  public serializeExtras() {
    return {
      _id: this.$extras._id?.toString(),
    };
  }
}
