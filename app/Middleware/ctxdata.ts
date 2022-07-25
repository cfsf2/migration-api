import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class UsuarioPermiso {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (typeof ctx.auth.user !== "undefined") {
      ctx.auth.user.Permisos = await ctx.auth.user?._Permisos();
      ctx.usuario = ctx.auth.user;
      ctx.usuario.configuracionesDeUsuario = {};
    }
    ctx.$_filtros = {
      solicitados: {},
      filtrosObligatorios: [],
    };
    ctx.$_filtros.solicitados = ctx.request.qs();
    ctx.$_sql = [];
    ctx.$_datos = [];
    ctx.$_errores = [];
    ctx.$_conf = { estructura: {}, buscarPadre: buscarPadre };

    await next();
  }
}

const buscarPadre = ({ id, conf }: { id: string; conf: any }) => {
  console.log(id, conf.id_a);
  let padre = "";
  const id_buscado = conf.sub_conf?.some((sc) => sc.id === id);

  if (id_buscado) {
    return conf;
  }

  conf.sub_conf?.forEach((sc) => (padre = buscarPadre({ id, conf: sc })));

  return padre;
};
