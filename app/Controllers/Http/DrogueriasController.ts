import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { boolaEnumObj, eliminarKeysVacios } from "App/Helper/funciones";
import Drogueria from "App/Models/Drogueria";

export default class DrogueriasController {
  public async mig_index({ request }: HttpContextContract) {
    return await Drogueria.traerDroguerias({ habilitado: "true" });
  }

  public async mig_admin({ request }: HttpContextContract) {
    return await Drogueria.traerDroguerias({});
  }

  public async mig_add({ request }: HttpContextContract) {
    const nuevaDrog = new Drogueria();
    nuevaDrog.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
    try {
      nuevaDrog.save();
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public async mig_update({ request, response }: HttpContextContract) {
    Drogueria.actualizarDrogueria(request.qs().id, request.body());
    return response.status(201).send("Se actualizo");
  }
}
