import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SolicitudProveeduria from "App/Models/SolicitudProveeduria";

export default class SolicitudesProveeduriaController {
  public async mig_index() {
    return await SolicitudProveeduria.traerSolicitudesProveeduria({});
  }

  public async mig_solicitud_farmacia({ request }: HttpContextContract) {
    const solicitud = await SolicitudProveeduria.traerSolicitudesProveeduria({
        farmaciaid: request.params().id_farmacia,
    });
    console.log(request.params().id_farmacia);
    return solicitud;
  }
}
