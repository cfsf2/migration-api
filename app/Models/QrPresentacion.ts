//import Mail from "@ioc:Adonis/Addons/Mail";
//import Env from "@ioc:Adonis/Core/Env";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
//import { generarHtml } from "App/Helper/email";
import { AccionCRUD, guardarDatosAuditoria } from "App/Helper/funciones";
import { DateTime } from "luxon";
import QrFarmacia from "./QrFarmacia";
// import Farmacia from "./Farmacia";
import Qr from "./Qr";
//import SParametro from "./SParametro";
import Presentacion from "./Presentacion";
import Update from "App/Helper/Update";
import Insertar from "App/Helper/Insertar";
import Farmacia from "./Farmacia";

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

  @column()
  public id_comisionista: number;

  @column()
  public anulado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

  @hasOne(() => QrFarmacia, {
    foreignKey: "id",
    localKey: "id_qr_farmacia",
  })
  public qrfarmacia: HasOne<typeof QrFarmacia>;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      extras[k] = this.$extras[k];
    });
    return extras;
  }

  public static async updateAnulado({
    ctx,
    usuario,
    id,
    valor,
    conf,
    insert_ids,
  }) {
    const anulado = valor === "s" ? "n" : "s";

    if (!id) {
      const registroCreado = (await Insertar.insertar({
        conf,
        ctx,
        insert_ids,
        usuario,
        valor: anulado,
      })) as { registroCreado: QrPresentacion };
      await registroCreado.registroCreado.load("qrfarmacia");
      const f = await Farmacia.find(
        registroCreado.registroCreado.qrfarmacia.id_farmacia
      );
      await registroCreado.registroCreado
        .merge({
          tipo_ingreso: "manual",
          id_comisionista:
            f?.id_comisionista_facturacion === 0
              ? undefined
              : f?.id_comisionista_facturacion,
        })
        .save();

      return registroCreado;
    }

    const registroModificado = (await Update._update({
      conf,
      ctx,
      id,
      usuario,
      valor: anulado,
    })) as QrPresentacion;

    await registroModificado.load("qrfarmacia");
    const f = await Farmacia.find(registroModificado.qrfarmacia.id_farmacia);

    registroModificado.merge({
      tipo_ingreso: "manual",
      id_comisionista: f?.id_comisionista_facturacion,
    });

    await registroModificado.save();
    return { registroModificado, modificado: true };
  }

  public static async nuevo({ ctx }) {
    const { id, INPUT_SELECT_FECHA_PRESENTACION } = ctx.request.body();

    if (!/^[+-]?\d+(\.\d+)?$/.test(INPUT_SELECT_FECHA_PRESENTACION)) {
      console.log(
        "INPUT_SELECT_FECHA_PRESENTACION",
        INPUT_SELECT_FECHA_PRESENTACION
      );
      throw {
        code: "NO_ES_NUMERICO",
        message: "No hay presentacion seleccionada.",
      };
    }

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

    return { registroModificado: nqp.toJSON(), creado: true };
  }
}
