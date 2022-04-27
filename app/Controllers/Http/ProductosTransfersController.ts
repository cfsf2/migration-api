import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { Permiso } from "App/Helper/permisos";
import TransferProducto from "App/Models/TransferProducto";
import TransferProductoInstitucion from "App/Models/TransferProductoInstitucion";

export default class ProductosTransfersController {
  public async mig_index({ bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_PRODS);

    return await TransferProducto.traerTrasferProducto({
      en_papelera: "n",
      habilitado: "s",
    });
  }

  public async mig_bylab({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LABID);

    const { instituciones } = request.qs();
    const labid = request.params().id;

    return await TransferProducto.traerTrasferProducto({
      en_papelera: "n",
      habilitado: "s",
      labid: labid,
      instituciones: instituciones,
    });
  }

  public async mig_instituciones({ request }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_PROD);
    const res = await TransferProductoInstitucion.query().where(
      "id_transfer_producto",
      request.params().id
    );

    const instituciones = res.map((r) => r.id_institucion.toString());
    return instituciones;
  }

  public async mig_add({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_PROD);

    return await TransferProducto.agregar(request.body());
  }

  public async mig_actualizar({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_PROD);

    return await TransferProducto.actualizar(request.qs().id, request.body());
  }

  public async mig_delete({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_DELETE_PROD);

    const prod = await TransferProducto.findOrFail(request.params().id);
    prod.merge({ habilitado: "n" });
    prod.save();
    return;
  }
}
