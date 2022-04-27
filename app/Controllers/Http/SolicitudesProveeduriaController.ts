import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { Permiso } from "App/Helper/permisos";
import SolicitudProveeduria from "App/Models/SolicitudProveeduria";

export default class SolicitudesProveeduriaController {
  public async mig_index({ bouncer }) {
    await bouncer.authorize("AccesoRuta", Permiso.PDP_GET_SOLICITUDES);
    return await SolicitudProveeduria.traerSolicitudesProveeduria({});
  }

  public async mig_solicitud_farmacia({
    request,
    bouncer,
  }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.PDP_GET_SOLICITUD_FARMACIA);

    const solicitud = await SolicitudProveeduria.traerSolicitudesProveeduria({
      farmaciaid: request.params().id_farmacia,
    });
    try {
      return solicitud;
    } catch (error) {
      return error;
    }
  }

  public async mig_agregar_solicitud({
    request,
    auth,
    bouncer,
  }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.PDP_CREATE_SOLICITUD);
    const usuario = auth.user;
    return await SolicitudProveeduria.crearSolicitud({
      data: request.body(),
      usuario: usuario,
    });
  }
}
