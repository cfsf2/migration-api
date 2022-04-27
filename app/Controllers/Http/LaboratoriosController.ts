import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { boolaEnumObj, eliminarKeysVacios } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Laboratorio from "App/Models/Laboratorio";

export default class LaboratoriosController {
  public async mig_index({ bouncer }) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LABS);
    return await Laboratorio.traerLaboratorios({});
  }

  public async mig_add({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_LAB);

    const nuevoLab = new Laboratorio();
    delete request.body()._id;
    nuevoLab.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
    try {
      nuevoLab.save();
    } catch (err) {
      console.log(err);
      return err;
    }
    return;
  }

  public async mig_update({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_LAB);

    const lab = await Laboratorio.findOrFail(request.qs().id);
    delete request.body()._id;
    lab.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
    try {
      lab.save();
      return;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public async mig_transfers({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LAB);
    return await Laboratorio.traerLaboratorios({ id: request.params().id });
  }
}
