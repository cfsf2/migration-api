import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { boolaEnumObj, eliminarKeysVacios } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Drogueria from "App/Models/Drogueria";

export default class DrogueriasController {
  public async mig_index({}: HttpContextContract) {
    return await Drogueria.traerDroguerias({ habilitado: "true" });
  }

  public async mig_admin({ bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_DROGUERIAS);
    return await Drogueria.traerDroguerias({});
  }

  public async mig_add({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_DROGUERIA);

    const nuevaDrog = new Drogueria();
    nuevaDrog.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
    try {
      nuevaDrog.save();
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public async mig_update({ request, response, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_DROGUERIA);
    Drogueria.actualizarDrogueria(request.qs().id, request.body());
    return response.status(201).send("Se actualizo");
  }
}
