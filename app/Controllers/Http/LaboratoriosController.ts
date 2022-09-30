import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import {
  AccionCRUD,
  boolaEnumObj,
  eliminarKeysVacios,
  guardarDatosAuditoria,
} from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Laboratorio from "App/Models/Laboratorio";

export default class LaboratoriosController {
  public async mig_index({ bouncer }) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LABS);
      return await Laboratorio.traerLaboratorios({});
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler();
    }
  }

  public async mig_add({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_LAB);
      const usuario = await auth.authenticate();

      const nuevoLab = new Laboratorio();
      delete request.body()._id;
      nuevoLab.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
      guardarDatosAuditoria({
        objeto: nuevoLab,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      nuevoLab.save();
    } catch (err) {
      throw new ExceptionHandler();
    }
    return;
  }

  public async mig_update({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_LAB);
      const usuario = await auth.authenticate();

      const lab = await Laboratorio.findOrFail(request.qs().id);
      delete request.body()._id;
      lab.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
      guardarDatosAuditoria({
        objeto: lab,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      lab.save();
      return;
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler();
    }
  }

  public async mig_transfers({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LAB);
      return await Laboratorio.traerLaboratorios({ id: request.params().id });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  //*****  CONTROLLERS ESTABLES */

  public async index({ bouncer }) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LABS);
      return await Laboratorio.query().where("habilitado", "s");
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler();
    }
  }
  public async transfers({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LAB);
      return await Laboratorio.query()
        .where("habilitado", "s")
        .andWhere("id", request.params().id)
        .firstOrFail();
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
