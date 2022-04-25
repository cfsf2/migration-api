import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import TransferProducto from "App/Models/TransferProducto";
import TransferProductoInstitucion from "App/Models/TransferProductoInstitucion";

export default class ProductosTransfersController {
  public async mig_index({ request }: HttpContextContract) {
    return await TransferProducto.traerTrasferProducto({
      en_papelera: "n",
      habilitado: "s",
    });
  }

  public async mig_bylab({ request }: HttpContextContract) {
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
    const res = await TransferProductoInstitucion.query().where(
      "id_transfer_producto",
      request.params().id
    );

    const instituciones = res.map((r) => r.id_institucion.toString());
    return instituciones;
  }

  public async mig_add({ request }: HttpContextContract) {
    return await TransferProducto.agregar(request.body());
  }

  public async mig_actualizar({ request }: HttpContextContract) {
    return await TransferProducto.actualizar(request.qs().id, request.body());
  }

  public async mig_delete({ request }: HttpContextContract) {
    const prod = await TransferProducto.findOrFail(request.params().id);
    prod.merge({ habilitado: "n" });
    prod.save();
    return;
  }
}
