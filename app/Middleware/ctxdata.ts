import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SConf from "App/Models/SConf";

export default class UsuarioPermiso {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    const buscarPadre = ({ id, conf }: { id: number; conf: any }) => {
      let padre = "";
      const id_buscado = conf.sub_conf?.some((sc) => sc.id === id);

      if (id_buscado) {
        return conf;
      }

      conf.sub_conf?.forEach((sc) => (padre = buscarPadre({ id, conf: sc })));

      return padre;
    };

    const buscarPadreData = ({
      id_a,
      conf,
      padreData,
    }: {
      id_a: string;
      conf: SConf;
      padreData?: string;
    }) => {
      let padre = padreData;
      const id_buscado = conf.sub_conf?.some((sc) => sc.id_a === id_a);

      if ([1, 2, 6, 7, 9].includes(conf.id_tipo)) {
        padre = conf.id_a;
      }

      if (id_buscado) {
        return padre;
      }

      console.log(id_a, padre);

      conf.sub_conf?.forEach(
        (sc) => (padre = buscarPadreData({ id_a, conf: sc, padreData: padre }))
      );
      return;
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
    ctx.$_conf = {
      estructura: {},
      buscarPadre: buscarPadre,
      getIDA: id_a,
      buscarPadreData: (id_a: string) => {
        return buscarPadreData({
          id_a: id_a,
          conf: ctx.$_conf.estructura,
        });
      },
    };
    ctx.$_id_general = ctx.request.body().id;

    await next();
  }
}
