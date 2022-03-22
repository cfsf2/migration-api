import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Entidad from "../../Models/Entidad";

export default class EntidadController {
    public async index ({ request } : HttpContextContract){
        return await Entidad.query();
    }
}