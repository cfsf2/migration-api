import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Entidad from "App/Models/Entidad";
import EstadoPedido from "App/Models/EstadoPedido";
import SolicitudProveeduria from "App/Models/SolicitudProveeduria";
import SolicitudProveeduriaProductoPack from "App/Models/SolicitudProveeduriaProductoPack";

export default class SolicitudesProveeduriaController {
  public async mig_index() {
    return await SolicitudProveeduria.traerSolicitudesProveeduria({});
  }

  public async mig_solicitud_farmacia({ request }: HttpContextContract) {
    const solicitud = await SolicitudProveeduria.traerSolicitudesProveeduria({
      farmaciaid: request.params().id_farmacia,
    });
    try {
      return solicitud;
    } catch (error) {
      return error;
    }
  }

  public async mig_agregar_solicitud({ request, auth }: HttpContextContract) {
    const usuario = auth.user;
    return await SolicitudProveeduria.crearSolicitud({
      data: request.body(),
      usuario: usuario,
    });
  }
}
