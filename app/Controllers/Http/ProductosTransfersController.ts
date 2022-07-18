import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { AccionCRUD, guardarDatosAuditoria } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import TransferProducto from "App/Models/TransferProducto";
import TransferProductoInstitucion from "App/Models/TransferProductoInstitucion";

export default class ProductosTransfersController {
  public async mig_index({ bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_PRODS);

      return await TransferProducto.traerTrasferProducto({
        en_papelera: "n",
        habilitado: "s",
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_bylab({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LABID);

      const { instituciones } = request.qs();
      const labid = request.params().id;

      return await TransferProducto.traerTrasferProducto({
        en_papelera: "n",
        habilitado: "s",
        labid: labid,
        instituciones: instituciones,
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_instituciones({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_PROD);
      const res = await TransferProductoInstitucion.query().where(
        "id_transfer_producto",
        request.params().id
      );

      const instituciones = res.map((r) => r.id_institucion.toString());
      return instituciones;
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_add({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_PROD);
      const usuario = await auth.authenticate();

      return await TransferProducto.agregar(request.body(), usuario);
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_actualizar({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_PROD);
      const usuario = await auth.authenticate();

      return await TransferProducto.actualizar(
        request.qs().id,
        request.body(),
        usuario
      );
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_delete({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_DELETE_PROD);
      const usuario = await auth.authenticate();

      const prod = await TransferProducto.findOrFail(request.params().id);
      prod.merge({ en_papelera: "s" });

      guardarDatosAuditoria({
        objeto: prod,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      await prod.save();
      return prod;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }
}
