import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SolicitudProveeduria from "App/Models/SolicitudProveeduria";

export default class SolicitudesProveeduriaController {
    public async mig_index(){
        return await SolicitudProveeduria.traerSolicitudesProveeduria();
    }
}