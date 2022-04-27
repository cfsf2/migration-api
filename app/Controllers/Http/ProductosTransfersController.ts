import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AccionCRUD } from "App/Helper/funciones";
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

  public async mig_instituciones({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_PROD);
    const res = await TransferProductoInstitucion.query().where(
      "id_transfer_producto",
      request.params().id
    );

    const instituciones = res.map((r) => r.id_institucion.toString());
    return instituciones;
  }

  public async mig_add({ request, bouncer, auth }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_PROD);
    const usuario = await auth.authenticate();

    return await TransferProducto.agregar(request.body(), usuario);
  }

  public async mig_actualizar({ request, bouncer, auth }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_PROD);
    const usuario = await auth.authenticate();

    return await TransferProducto.actualizar(
      request.qs().id,
      request.body(),
      usuario
    );
  }

  public async mig_delete({ request, bouncer, auth }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_DELETE_PROD);
    const usuario = await auth.authenticate();

    const prod = await TransferProducto.findOrFail(request.params().id);
    prod.merge({ habilitado: "n" });

    try {
      guardarDatosAuditoria({
        objeto: prod,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      prod.save();
      return;
    } catch (error) {}
  }
}

function guardarDatosAuditoria(arg0: {
  objeto: any;
  usuario: import("../../Models/Usuario").default;
  accion: any;
}) {
  throw new Error("Function not implemented.");
}
