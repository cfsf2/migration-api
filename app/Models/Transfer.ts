import { DateTime } from "luxon";
import {
  BaseModel,
  belongsTo,
  BelongsTo,
  column,
  HasMany,
  hasMany,
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

import { html_transfer, transferHtml } from "../Helper/email";
import { AccionCRUD, guardarDatosAuditoria } from "../Helper/funciones";
import Mail from "@ioc:Adonis/Addons/Mail";
// import FarmaciaLaboratorio from "./FarmaciaLaboratorio";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import Apm from "./Apm";
import ApmFarmacia from "./ApmFarmacia";
import TransferEmail from "./TransferEmail";
import FarmaciaLaboratorio from "./FarmaciaLaboratorio";

export default class Transfer extends BaseModel {
  public static table = "tbl_transfer";
  static async traerTransfers({ id_farmacia }: { id_farmacia?: number }) {
    const transfers = await Database.from("tbl_transfer as t")
      .select(
        "t.*",
        "t.id as _id",
        "t.id as codigo_transfer",
        "t.ts_modificacion as fecha_modificacion",
        "t.fecha as fecha_alta",
        "d.nombre as drogueria_id",
        "l.nombre as laboratorio_id",
        "f.matricula as farmacia_id",
        "f.nombre as farmacia_nombre",
        "f.id as id_farmacia",
        "et.nombre as estado",
        "u.id_usuario_creacion as id_usuario_creacion",
        "u.id_usuario_modificacion as ultima_modificacion"
      )
      .leftJoin("tbl_drogueria as d", "t.id_drogueria", "d.id")
      .leftJoin("tbl_farmacia as f", "t.id_farmacia", "f.id")
      .leftJoin("tbl_laboratorio as l", "l.id", "t.id_laboratorio")
      .leftJoin("tbl_estado_transfer as et", "t.id_transfer_estado", "et.id")
      .leftJoin("tbl_usuario as u", "t.id", "u.id")
      .if(id_farmacia, (query) => {
        // console.log(id_farmacia);
        query.where("t.id_farmacia", id_farmacia as number);
      })
      .orderBy("id", "desc");

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

        let counter = 0;

        if (productos.length === 0) {
          try {
            t.productos_solicitados = await JSON.parse(
              t.productos_solicitados.replace(/\s*"/g, '"')
            );
          } catch (error) {
            counter += 1;
            // console.log(counter);
            // console.log(t.productos_solicitados);
            console.log(error);
            return t;
          }
        } else {
          t.productos_solicitados = productos;
        }
        return t;
      })
    );

    return res;
  }

  static async guardar({
    data,
    usuario,
    ctx,
  }: {
    data: any;
    usuario: Usuario;
    ctx: HttpContextContract;
  }) {
    const nuevoTransfer = new Transfer();
    try {
      const drogueria = await Drogueria.findByOrFail(
        "nombre",
        data.drogueria_id
      );
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

      await Promise.all(
        data.productos_solicitados.map(async (p) => {
          const transferProducto = new TransferTransferProducto();
          transferProducto.merge({
            id_transfer_producto: p.id,
            id_transfer: nuevoTransfer.id,
            cantidad: p.cantidad,
            precio: p.precio,
            observaciones: p.observacion,

            id_usuario_creacion: usuario.id, // cambiar por dato de sesion
          });
          guardarDatosAuditoria({
            objeto: transferProducto,
            usuario: usuario,
            accion: AccionCRUD.crear,
          });
          await transferProducto.save();
        })
      );

      await nuevoTransfer.load("ttp" as any, (ttp) =>
        ttp.preload("transfer_producto")
      );
      await nuevoTransfer.load("farmacia" as any);
      await nuevoTransfer.load("laboratorio" as any);
      await nuevoTransfer.load("drogueria" as any);

      Mail.send((message) => {
        message
          .from(process.env.SMTP_USERNAME as string)
          .to(farmacia.email as string)
          .to(process.env.TRANSFER_EMAIL as string)
          .to(process.env.TRANSFER_EMAIL2 as string)
          .subject(
            "Confirmacion de pedido de Transfer" + " " + nuevoTransfer.id
          )
          .html(html_transfer(nuevoTransfer));
      });
    } catch (err) {
      console.log(err);
      Mail.send((message) => {
        message
          .from(process.env.SMTP_USERNAME as string)
          .to(process.env.SISTEMAS_EMAIL as string)
          .subject("ERROR AL ENVIAR Transfer" + " " + nuevoTransfer.id)
          .html(html_transfer(this) + err.toString());
      });
      throw new ExceptionHandler().handle(err, ctx);
    }
  }

  static async guardar_sql({
    data,
    usuario,
    ctx,
  }: {
    data: any;
    usuario: Usuario;
    ctx: any;
  }) {
    const nuevoTransfer = new Transfer();
    try {
      const laboratorio = await Laboratorio.query()
        .where("id", data.id_laboratorio)
        .preload("modalidad_entrega")
        .preload("apms")
        .preload("tipo_comunicacion")
        .preload("droguerias")
        .firstOrFail();
      let drogueria = null as unknown as Drogueria;

      // *********** Chequear modalidad_entrega
      if (
        laboratorio.modalidad_entrega.id_a === "ALGUNAS_DROGUERIAS" ||
        laboratorio.modalidad_entrega.id_a === "TODAS_DROGUERIAS"
      ) {
        drogueria = await Drogueria.findOrFail(data.id_drogueria);
      }
      if (laboratorio.modalidad_entrega.id_a === "DIRECTO") {
        const FL = await FarmaciaLaboratorio.query()
          .where("id_farmacia", usuario.farmacia.id)
          .where("id_laboratorio", data.id_laboratorio)
          .first();

        if (!FL) {
          const newFL = new FarmaciaLaboratorio();
          newFL.merge({
            id_farmacia: usuario.farmacia.id,
            id_laboratorio: data.id_laboratorio,
            nro_cuenta: data.nro_cuenta_drogueria,
          });
          guardarDatosAuditoria({
            objeto: newFL,
            usuario: usuario,
            accion: AccionCRUD.crear,
          });
          await newFL.save();
        }
        if (FL) {
          FL.merge({
            id_farmacia: usuario.farmacia.id,
            id_laboratorio: data.id_laboratorio,
            nro_cuenta: data.nro_cuenta_drogueria,
          });
          guardarDatosAuditoria({
            objeto: FL,
            usuario: usuario,
            accion: AccionCRUD.editar,
          });
          await FL.save();
        }
      }

      const farmacia = await Farmacia.findByOrFail("id_usuario", usuario.id);

      //** Validar monto Minimo y cantidad Minima */
      if (laboratorio.monto_minimo_transfer > 0) {
        let monto = data.productos_solicitados.reduce((p, c) => {
          const cantidad = c.cantidad;
          const precio = c.precio;
          return precio * cantidad + p;
        }, 0);

        if (laboratorio.monto_minimo_transfer > monto) {
          return new ExceptionHandler().handle(
            {
              code: "TRANSFER_NO_SUPERA_MONTO_MINIMO",
              valor: laboratorio.monto_minimo_transfer,
            },
            ctx
          );
        }
      }

      if (laboratorio.unidades_minimas_transfer > 0) {
        let cantidad_unidades = data.productos_solicitados.reduce((p, c) => {
          const cantidad = c.cantidad;

          return cantidad + p;
        }, 0);

        if (laboratorio.unidades_minimas_transfer > cantidad_unidades) {
          return new ExceptionHandler().handle(
            {
              code: "TRANSFER_NO_SUPERA_CANTIDAD_MINIMA",
              valor: laboratorio.unidades_minimas_transfer,
            },
            ctx
          );
        }
      }

      nuevoTransfer.merge({
        nro_cuenta_drogueria: data.nro_cuenta_drogueria,
        id_drogueria: drogueria?.id,
        id_laboratorio: laboratorio.id,
        id_transfer_estado: 1,
        id_farmacia: farmacia.id,
        fecha: DateTime.now(),
        email_destinatario: farmacia.email ? farmacia.email : usuario.email,
        productos_solicitados: JSON.stringify(data.productos_solicitados),
        nro_cuenta_tabla:
          laboratorio.modalidad_entrega.id_a === "DIRECTO"
            ? "tbl_laboratorio"
            : "tbl_drogueria",
        id_usuario_creacion: usuario.id, // cambiar por dato de sesion

        envia_email_transfer_auto: laboratorio.envia_email_transfer_auto,
        monto_minimo_transfer: laboratorio.monto_minimo_transfer,
        unidades_minimas_transfer: laboratorio.unidades_minimas_transfer,
      });

      guardarDatosAuditoria({
        objeto: nuevoTransfer,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });

      await nuevoTransfer.save();

      nuevoTransfer
        .merge({
          email_laboratorio_apm: await nuevoTransfer.getDestinatario(),
        })
        .save();

      //***  Registra los productos transfer solicitados */
      await Promise.all(
        data.productos_solicitados.map(async (p) => {
          const transferProducto = new TransferTransferProducto();

          transferProducto.merge({
            id_transfer_producto: p.id,
            id_transfer: nuevoTransfer.id,
            cantidad: p.cantidad,
            precio: p.precio,
            observaciones: p.observacion,
            id_usuario_creacion: usuario.id, // cambiar por dato de sesion
          });
          guardarDatosAuditoria({
            objeto: transferProducto,
            usuario: usuario,
            accion: AccionCRUD.crear,
          });
          return transferProducto.save();
        })
      );
      // *** en Lugar de enviar el mail, se suma un registro a la tabla transfer_email para que el cron ejecute la funcion

      return await nuevoTransfer.generarColaEmail(ctx);
      if (laboratorio.envia_email_transfer_auto === "s") {
        return nuevoTransfer.enviarMailAutomatico();
      }

      return Mail.send((message) => {
        message
          .from(process.env.SMTP_USERNAME as string)
          .to(farmacia.email as string)
          .to(process.env.TRANSFER_EMAIL as string)
          .to(process.env.TRANSFER_EMAIL2 as string)
          .subject(
            "Confirmacion de pedido de Transfer" + " " + nuevoTransfer.id
          )
          .html(transferHtml({ transfer: data, farmacia: farmacia }));
      });
    } catch (err) {
      console.log("MODELO", err);
      Mail.send((message) => {
        message
          .from(process.env.SMTP_USERNAME as string)
          .to(process.env.SISTEMAS_EMAIL as string)
          .subject("ERROR AL ENVIAR Transfer" + " " + nuevoTransfer.id)
          .html(html_transfer(this) + err.toString());
      });
      throw new ExceptionHandler().handle(err, ctx);
    }
  }

  public async generarColaEmail(ctx: HttpContextContract) {
    const nuevoEmail = new TransferEmail();
    guardarDatosAuditoria({
      objeto: nuevoEmail,
      usuario: ctx.auth.user as Usuario,
      accion: AccionCRUD.crear,
    });

    const destinatarios = [
      process.env.TRANSFER_EMAIL,
      process.env.TRANSFER_EMAIL2,
      this.farmacia.email,
    ];

    if (this.laboratorio.envia_email_transfer_auto === "s") {
      destinatarios.push(await this.getDestinatario());
    }

    nuevoEmail.merge({
      id_transfer: this.id,
      emails: destinatarios.filter((c) => c).toString(),
      enviado: "n",
    });
    return await nuevoEmail.save();
  }

  public async generarColaEmailUnico(ctx: HttpContextContract, email) {
    const nuevoEmail = new TransferEmail();

    guardarDatosAuditoria({
      objeto: nuevoEmail,
      usuario: ctx.auth.user as Usuario,
      accion: AccionCRUD.crear,
    });
    nuevoEmail.merge({
      id_transfer: this.id,
      emails: email.replace(/;/g, ",").replace(/:/g, ","),
      enviado: "n",
    });
    return await nuevoEmail.save();
  }

  public async enviarMailAutomatico() {
    await this.load("ttp" as any, (ttp) => ttp.preload("transfer_producto"));
    await this.load("farmacia" as any);
    await this.load("laboratorio" as any);

    const laboratorio = await Laboratorio.query()
      .where("id", this.id_laboratorio)
      .preload("apms")
      .preload("tipo_comunicacion")
      .preload("modalidad_entrega")
      .firstOrFail();

    if (laboratorio.envia_email_transfer_auto !== "s") {
      return Mail.send((message) => {
        message
          .from(process.env.SMTP_USERNAME as string)
          .to(this.farmacia.email as string)
          .to(process.env.TRANSFER_EMAIL as string)
          .to(process.env.TRANSFER_EMAIL2 as string)
          .subject("Confirmacion de pedido de Transfer" + " " + this.id)
          .html(html_transfer(this));
      });
    }

    let destinatarioProveedor = await this.getDestinatario();

    const mail = await Mail.send((message) => {
      message
        .from(process.env.SMTP_USERNAME as string)
        .to(this.email_destinatario as string)
        .bcc(destinatarioProveedor)
        .to(process.env.TRANSFER_EMAIL as string)
        .to(process.env.TRANSFER_EMAIL2 as string)
        .subject("Confirmacion de pedido de Transfer" + " " + this.id)
        .html(html_transfer(this));
    });

    return mail;
  }

  public async getDestinatario() {
    await this.load("ttp" as any, (ttp) => ttp.preload("transfer_producto"));
    await this.load("farmacia" as any);
    await this.load("laboratorio" as any);

    const laboratorio = await Laboratorio.query()
      .where("id", this.id_laboratorio)
      .preload("apms")
      .preload("tipo_comunicacion")
      .preload("modalidad_entrega")
      .firstOrFail();

    let destinatarioProveedor = "";

    switch (laboratorio.tipo_comunicacion.id_a) {
      case "TC_LABORATORIO":
        // if (!laboratorio.email)
        //   throw await new ExceptionHandler().handle(
        //     { code: "LAB_SIN_EMAIL" },
        //     {} as HttpContextContract
        //   );
        destinatarioProveedor = laboratorio.email;
        break;
      case "TC_APM":
        if (laboratorio.tiene_apms === "s") {
          let apm = await Apm.query()
            .leftJoin("tbl_apm_farmacia as af", "af.id_apm", "tbl_apm.id")
            .where("af.id_farmacia", this.id_farmacia)
            .where("af.id_laboratorio", this.id_laboratorio)
            .first();
          if (!apm) {
            apm = (await Apm.query()
              .where("id_laboratorio", this.id_laboratorio)
              .andWhere("administrador", "s")
              .first()) as any;
            if (!apm) {
              //  console.log("no hay apms pero deberia");
              destinatarioProveedor = laboratorio.email;
              break;
            }
            destinatarioProveedor = apm.email;
          }
          break;
        }
        // console.log("no hay apms");
        destinatarioProveedor = laboratorio.email;
        break;
      case "TC_DROGUERIA":
        await this.load("drogueria" as any);

        if (laboratorio.modalidad_entrega.id_a === "ALGUNAS_DROGUERIAS") {
          const drogueria = await Drogueria.query()
            .leftJoin(
              "tbl_laboratorio_drogueria as ld",
              "ld.id_drogueria",
              "tbl_drogueria.id"
            )
            .where("ld.id_laboratorio", this.id_laboratorio)
            .andWhere("ld.id_drogueria", this.id_drogueria)
            .firstOrFail();
          destinatarioProveedor = drogueria.email;
        }
        if (laboratorio.modalidad_entrega.id_a === "TODAS_DROGUERIAS") {
          const drogueria = await Drogueria.query()
            .where("id", this.id_drogueria)
            .firstOrFail();
          destinatarioProveedor = drogueria.email;
        }
        break;
    }

    return destinatarioProveedor;
  }

  public async enviarMail(email) {
    try {
      await this.load("ttp" as any, (ttp) => ttp.preload("transfer_producto"));
      await this.load("farmacia" as any);
      await this.load("laboratorio" as any);
      await this.load("drogueria" as any);

      return await Mail.send((message) => {
        message
          .from(process.env.SMTP_USERNAME as string)
          .to(email as string)
          .subject("Confirmacion de pedido de Transfer" + " " + this.id)
          .html(html_transfer(this));
      });
    } catch (err) {
      console.log(err);
      Mail.send((message) => {
        message
          .from(process.env.SMTP_USERNAME as string)
          .to(process.env.SISTEMAS_EMAIL as string)
          .subject("ERROR AL ENVIAR Transfer" + " " + this.id)
          .html(html_transfer(this) + err.toString());
      });
      throw new ExceptionHandler(); //.handle(err, ctx);
    }
  }

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
  public nro_cuenta_tabla: string;

  @column()
  public id_apm: string;

  @column()
  public envio_email_verificado: string;

  @column()
  public monto_minimo_transfer: number;

  @column()
  public unidades_minimas_transfer: number;

  @column()
  public envia_email_transfer_auto: string;

  @column()
  public email_laboratorio_apm: string;

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

  @hasOne(() => Apm, {
    foreignKey: "id",
    localKey: "id_apm",
  })
  public apm: HasOne<typeof Apm>;

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

  @belongsTo(() => Drogueria, {
    foreignKey: "id_drogueria",
    localKey: "id",
  })
  public drogueria: BelongsTo<typeof Drogueria>;

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

  @hasMany(() => TransferTransferProducto, {
    localKey: "id",
    foreignKey: "id_transfer",
  })
  public ttp: HasMany<typeof TransferTransferProducto>;

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
