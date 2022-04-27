import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AccionCRUD, boolaEnumObj, eliminarKeysVacios, guardarDatosAuditoria } from "App/Helper/funciones";
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

  public async mig_add({ request, bouncer, auth }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_DROGUERIA);
    const usuario = await auth.authenticate();

    const nuevaDrog = new Drogueria();
    nuevaDrog.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
    try {
      guardarDatosAuditoria({
        objeto: nuevaDrog,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      nuevaDrog.save();
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public async mig_update({ request, response, bouncer, auth }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_DROGUERIA);
    const usuario = await auth.authenticate();

    Drogueria.actualizarDrogueria(request.qs().id, request.body(), usuario);
    return response.status(201).send("Se actualizo");
  }
}
