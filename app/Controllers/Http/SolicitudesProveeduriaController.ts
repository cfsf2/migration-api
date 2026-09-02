import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { Permiso } from "App/Helper/permisos";
import SolicitudProveeduria from "App/Models/SolicitudProveeduria";

export default class SolicitudesProveeduriaController {
  public async mig_index({ bouncer }) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_GET_SOLICITUDES);
      return await SolicitudProveeduria.traerSolicitudesProveeduria({});
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_solicitud_farmacia({
    request,
    bouncer,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_GET_SOLICITUD_FARMACIA);

      const solicitud = await SolicitudProveeduria.traerSolicitudesProveeduria({
        farmaciaid: request.params().id_farmacia,
      });
      return solicitud;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }

  public async mig_agregar_solicitud({
    request,
    auth,
    bouncer,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_CREATE_SOLICITUD);
      const usuario = auth.user;
      return await SolicitudProveeduria.crearSolicitud({
        data: request.body(),
        usuario: usuario,
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
