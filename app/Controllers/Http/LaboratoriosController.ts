import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { AccionCRUD, boolaEnumObj, eliminarKeysVacios, guardarDatosAuditoria } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Laboratorio from "App/Models/Laboratorio";
import auth from "Config/auth";

export default class LaboratoriosController {
  public async mig_index({ bouncer }) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LABS);
    return await Laboratorio.traerLaboratorios({});
  }

  public async mig_add({ request, bouncer, auth }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_LAB);
    const usuario = await auth.authenticate();

    const nuevoLab = new Laboratorio();
    delete request.body()._id;
    nuevoLab.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
    try {
      guardarDatosAuditoria({
        objeto: nuevoLab,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      nuevoLab.save();
    } catch (err) {
      console.log(err);
      return err;
    }
    return;
  }

  public async mig_update({ request, bouncer, auth }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_LAB);
    const usuario = await auth.authenticate();

    const lab = await Laboratorio.findOrFail(request.qs().id);
    delete request.body()._id;
    lab.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
    try {
      guardarDatosAuditoria({
        objeto: lab,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
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
