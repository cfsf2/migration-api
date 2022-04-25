import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import EstadoPedido from "App/Models/EstadoPedido";
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
    try {
      return solicitud;
    } catch (error) {
      return error;
    }
  }

  public async mig_agregar_solicitud({ request }: HttpContextContract) {
    const nuevaSolicitud = new SolicitudProveeduria();

    nuevaSolicitud.merge({
      // asunto: "Confirmación de pedido a Proveeduria"
      // destinatario: "farmaciadonado@gmail.com"
      email_destinatario: request.body().email_destinatario,
      id_entidad: request.body().entidad_id,
      //estado: 
      id_farmacia: request.body().farmacia_id,
      //farmacia_nombre:
      fecha: request.body().fecha,
      //html:
      productos_solicitados: request.body().productos_solicitados,
    });
    console.log(nuevaSolicitud);
    return;
  }
}
