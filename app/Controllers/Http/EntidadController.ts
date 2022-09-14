import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import {
  AccionCRUD,
  eliminarKeysVacios,
  guardarDatosAuditoria,
} from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Entidad from "../../Models/Entidad";

export default class EntidadController {
  public async index() {
    try {
      return await Entidad.traerEntidades({ habilitado: "s" });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async index_Admin({ bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_GET_ENTIDADES);
      return await Entidad.traerEntidades({});
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_agregar_entidad({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      const usuario = await auth.authenticate();
      await bouncer.authorize("AccesoRuta", Permiso.PDP_CREATE_ENTIDADES);

      const nuevaEntidad = new Entidad();

      nuevaEntidad.merge({
        imagen: request.body().imagen,
        logo: request.body().logo,
        habilitado: (request.body().habilitado = "s"),
        email: request.body().email,
        nombre: request.body().entidadnombre, //entidadnombre
        titulo: request.body().nombre, //nombre
        rentabilidad: request.body().rentabilidad,
        mostrar_en_proveeduria: request.body().no_mostrar_en_proveeduria
          ? request.body().no_mostrar_en_proveeduria === "true"
            ? "s"
            : "n"
          : "s",
      });

      guardarDatosAuditoria({
        objeto: nuevaEntidad,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      nuevaEntidad.save();
      return nuevaEntidad;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }

  public async mig_update_entidad({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      const usuario = await auth.authenticate();
      await bouncer.authorize("AccesoRuta", Permiso.PDP_UPDATE_ENTIDADES);

      const { id } = request.qs();

      let entidad = await Entidad.findOrFail(id);

      let mergeObject: any = {
        imagen: request.body().imagen,
        logo: request.body().logo,
        habilitado:
          typeof request.body().habilitado !== "undefined"
            ? request.body().habilitado === "s"
              ? "s"
              : "n"
            : null,
        email: request.body().email,
        nombre: request.body().entidadnombre, //entidadnombre
        titulo: request.body().nombre, //nombre
        rentabilidad: request.body().rentabilidad,
        mostrar_en_proveeduria:
          typeof request.body().no_mostrar_en_proveeduria !== "undefined"
            ? request.body().no_mostrar_en_proveeduria === "true"
              ? "n"
              : "s"
            : null,
      };
      console.log("habilitado? ; ", `${request.body().mostrar_en_proveeduria}`);

      mergeObject = eliminarKeysVacios(mergeObject);

      entidad.merge(mergeObject);

      guardarDatosAuditoria({
        objeto: entidad,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      entidad.save();
      return entidad;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }

  public async mig_delete({ request, bouncer, auth }: HttpContextContract) {
    try {
      const usuario = await auth.authenticate();
      await bouncer.authorize("AccesoRuta", Permiso.PDP_DELETE_ENTIDADES);

      const { id } = request.params();

      let entidad = await Entidad.findOrFail(id);

      entidad.merge({
        habilitado: "n",
      });
      guardarDatosAuditoria({
        objeto: entidad,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      entidad.save();

      return entidad;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }
}
