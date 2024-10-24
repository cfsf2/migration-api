import Farmacia from "./Farmacia";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { getConf } from "App/Controllers/Http/ConfigsController";
import { AccionCRUD, guardarDatosAuditoria } from "App/Helper/funciones";
import Insertar from "App/Helper/Insertar";
import Usuario from "./Usuario";

export default class FarmaciaAux extends Farmacia {
  public static async insertNuevaFarmaciaConUsuario({
    ctx,
  }: {
    ctx: HttpContextContract;
  }) {
    const registro = await Insertar._insertarABM({
      ctx,
      formData: ctx.request.body(),
      conf: await getConf(ctx.request.body().id_a),
    });

    await guardarDatosAuditoria({
      usuario: ctx.usuario,
      objeto: registro,
      accion: AccionCRUD.crear,
      registroCambios: { registrarCambios: "n" },
    });

    const usuario = new Usuario();

    usuario.merge({
      usuario: ctx.request.body().usuario,
      password: ctx.request.body().password,
      esfarmacia: "s",
      nombre: registro.nombre,
    });
    await usuario.save();
    // const asignarPerfil = new UsuarioPerfil();
    // await asignarPerfil.merge({ id_usuario: usuario.id, id_perfil: 2 }).save();

    registro.merge({ id_usuario: usuario.id });

    await registro.save();
    return { registroCreado: registro, creado: true };
  }
}
