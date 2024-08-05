//import Mail from "@ioc:Adonis/Addons/Mail";
//import Env from "@ioc:Adonis/Core/Env";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";
//import { generarHtml } from "App/Helper/email";
import { AccionCRUD, guardarDatosAuditoria } from "App/Helper/funciones";
import { DateTime } from "luxon";
import QrFarmacia from "./QrFarmacia";
// import Farmacia from "./Farmacia";
import Qr from "./Qr";
//import SParametro from "./SParametro";
import Presentacion from "./Presentacion";

export default class QrPresentacion extends BaseModel {
  public static table = "tbl_qr_presentacion";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_presentacion: number;

  @column()
  public id_qr_farmacia: number;

  @column()
  public observaciones: string;
  
  @column()
  public tipo_ingreso: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      extras[k] = this.$extras[k];
    });
    return extras;
  }

  public static async nuevo({ ctx }) {
    const { id, INPUT_SELECT_FECHA_PRESENTACION } = ctx.request.body();

    const nqp = new QrPresentacion();
    nqp.merge({
      id_qr_farmacia: id,
      id_presentacion: INPUT_SELECT_FECHA_PRESENTACION,
      observaciones: "",
    });

    await guardarDatosAuditoria({
      usuario: ctx.usuario,
      objeto: nqp,
      accion: AccionCRUD.crear,
      registroCambios: { registrarCambios: "n" },
    });
    await nqp.save();

    const qr_farmacia = await QrFarmacia.findOrFail(id);
    // const farmacia = await Farmacia.findOrFail(qr_farmacia.id_farmacia);
    const qr = await Qr.findOrFail(qr_farmacia.id_qr);
    const presentacion = await Presentacion.findOrFail(nqp.id_presentacion);
    const ts_creacion_presentacion = DateTime.fromISO(
      nqp.ts_creacion as any
    ).toFormat("dd/MM/yyyy");

    qr;
    presentacion;
    ts_creacion_presentacion;

    // if (farmacia.email && farmacia.email != "") {
    //   const mensaje_parametro = await SParametro.findByOrFail(
    //     "id_a",
    //     "MENSAJE_QR_INGRESADO"
    //   );

    //   const html = `<div>${eval("`" + mensaje_parametro.valor + "`")}</div>`;
    //   await Mail.send((message) => {
    //     message.from(Env.get("FARMAGEO_EMAIL"));

    //     message.to(farmacia.email);

    //     message.subject("Aviso QR farmacia ingresado").html(
    //       generarHtml({
    //         titulo: `Aviso QR farmacia ingresado`,
    //         // imagen: '',
    //         texto: `${html}`,
    //       })
    //     );
    //   });
    // }

    return { registroModificado: nqp.toJSON(), creado: true };
  }
}
