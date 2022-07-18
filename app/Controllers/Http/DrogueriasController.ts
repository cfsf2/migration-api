import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import {
  AccionCRUD,
  boolaEnumObj,
  eliminarKeysVacios,
  guardarDatosAuditoria,
} from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Drogueria from "App/Models/Drogueria";

export default class DrogueriasController {
  public async mig_index({}: HttpContextContract) {
    try {
      return await Drogueria.traerDroguerias({ habilitado: "true" });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_admin({ bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_DROGUERIAS);
      return await Drogueria.traerDroguerias({});
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_add({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_DROGUERIA);
      const usuario = await auth.authenticate();

      const nuevaDrog = new Drogueria();
      nuevaDrog.merge(eliminarKeysVacios(boolaEnumObj(request.body())));
      guardarDatosAuditoria({
        objeto: nuevaDrog,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      nuevaDrog.save();
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_update({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_DROGUERIA);
      const usuario = await auth.authenticate();

      Drogueria.actualizarDrogueria(request.qs().id, request.body(), usuario);
      return response.status(201).send("Se actualizo");
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
