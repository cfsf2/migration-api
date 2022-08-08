import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SConf from "App/Models/SConf";

export default class UsuarioPermiso {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const buscarPadre = ({ id, conf }: { id: number; conf: any }) => {
      console.log(id, conf.id_a);
      let padre = "";
      const id_buscado = conf.sub_conf?.some((sc) => sc.id === id);

      if (id_buscado) {
        return conf;
      }

      conf.sub_conf?.forEach((sc) => (padre = buscarPadre({ id, conf: sc })));

      return padre;
    };

    const id_a = (id: number, estructura?: SConf) => {
      if (!estructura) {
        estructura = ctx.$_conf.estructura;
      }
      let IDA = "";

      if (estructura?.id === id) {
        IDA = estructura.id_a;
        return IDA;
      }

      if (!estructura) return;

      const id_encontrado = estructura.sub_conf?.find((sc) => sc.id === id);

      if (id_encontrado) {
        IDA = id_encontrado.id_a;
        return IDA;
      }
      estructura.sub_conf?.forEach((sc) => id_a(id, sc));
      return IDA;
    };

    if (typeof ctx.auth.user !== "undefined") {
      ctx.auth.user.Permisos = await ctx.auth.user?._Permisos();
      ctx.usuario = ctx.auth.user;
      ctx.usuario.configuracionesDeUsuario = {};
      ctx.usuario.configuracionesPermitidas = `"INICIO"`;
    }
    ctx.$_filtros = {
      solicitados: {},
      filtrosObligatorios: [],
    };
    ctx.$_filtros.solicitados = ctx.request.qs();
    ctx.$_sql = [];
    ctx.$_datos = [];
    ctx.$_errores = [];
    ctx.$_conf = { estructura: {}, buscarPadre: buscarPadre, getIDA: id_a };
    ctx.$_id_general = ctx.request.body().id;

    await next();
  }
}
