import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Mail from "@ioc:Adonis/Addons/Mail";
import { generarHtml } from "../../Helper/email";

import Farmacia from "../../Models/Farmacia";
import { DateTime } from "luxon";
import Usuario from "App/Models/Usuario";

export default class FarmaciasController {
  public async index() {
    return await Farmacia.query()
      .preload("servicios", (servicio) => {
        servicio.where("tbl_servicio.habilitado", "s");
      })
      .preload("localidad");
  }

  public async mig_index() {
    return await Farmacia.traerFarmacias({});
  }

  public async mig_perfil({ request }: HttpContextContract) {
    const farmacia = await Farmacia.traerFarmacias({
      usuario: request.params().usuario,
    });

    if (request.url().includes("login") && farmacia.length !== 0) {
      console.log("actualizar ultimo acceso a ", farmacia.nombre);

      const farmaciaLogueada = await Farmacia.findOrFail(farmacia.id);

      farmaciaLogueada.f_ultimo_acceso = DateTime.now()
        .setLocale("es-Ar")
        .toFormat("yyyy-MM-dd hh:mm:ss");

      try {
        farmaciaLogueada.save();
      } catch (err) {
        return console.log(err);
      }
    }
    return farmacia;
  }

  public async mig_matricula({ request }: HttpContextContract) {
    const { matricula } = request.params();
    return await Farmacia.traerFarmacias({ matricula });
  }

  public async mig_mail({ request }: HttpContextContract) {
    Mail.send((message) => {
      message
        .from("farmageoapp@gmail.com")
        .to(request.body().destinatario)
        .subject(request.body().asunto)
        .html(
          generarHtml({
            titulo: "Nueva solicitud de registro de farmacia",
            // imagen: '',
            texto: `${request.body().html}`,
          })
        );
    });
  }

  public async mig_updatePerfil({ request, response }: HttpContextContract) {
    const { username } = request.qs();

    try {
      return response.created(
        await Farmacia.acutalizarFarmacia({
          usuario: username,
          d: request.body(),
        })
      );
    } catch (err) {
      return err;
    }
  }

  public async mig_create({ request }: HttpContextContract) {
    return Farmacia.crearFarmacia(request.body());
  }

  public async mig_admin_passwords({ request }: HttpContextContract) {}
  public async existeUsuario({ request }: HttpContextContract) {
    const existe = await Usuario.findBy("usuario", request.params().usuario);

    if (existe) return true;
    return false;
  }
}
