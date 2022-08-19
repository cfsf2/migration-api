import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import {
  listado,
  vista,
  modificar,
  insertar,
  eliminar,
  ConfBuilder,
  insertarABM,
} from "App/Helper/configuraciones";
import SConf from "App/Models/SConf";
import { acciones } from "App/Helper/permisos";

const preloadRecursivo = (query) => {
  return query
    .preload("conf_permiso", (query) => query.preload("permiso"))
    .preload("tipo")
    .preload("orden")
    .preload("valores", (query) => query.preload("atributo"))
    .preload("sub_conf", (query) => preloadRecursivo(query));
};

export default class ConfigsController {
  public async Config(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;

    const config = request.qs().pantalla;
    const usuario = await auth.authenticate();
    const id = request.body().id;
    const queryFiltros = request.qs();
    if (!config) {
      return listadoVacio;
    }
    const conf = await SConf.query()
      .where("id_a", config)
      .preload("conf_permiso")
      .preload("tipo")
      .preload("orden")
      .preload("valores", (query) => query.preload("atributo"))
      .preload("sub_conf", (query) => preloadRecursivo(query))
      .firstOrFail();
    ctx.$_conf.estructura = conf;
    // para listado
    if (!(await bouncer.allows("AccesoConf", conf))) return listadoVacio;

    if (conf.tipo.id === 2) {
      console.log("pidio Listado");
      try {
        return ConfBuilder.armarListado(
          ctx,
          conf,
          conf,
          bouncer,
          queryFiltros,
          id,
          usuario,
          "n"
        );
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    if (conf.tipo.id === 6) {
      console.log("pidio Vista");
      try {
        return ConfBuilder.armarVista(ctx, conf, id, conf, bouncer, usuario);
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    if (conf.tipo.id === 7) {
      console.log("Pidio contenedor", config.id_a);
      let contenedor = conf;
      const p: {
        opciones: {};
        configuraciones: any[];
      } = {
        opciones: { id_a: contenedor.id_a, tipo: contenedor.tipo },
        configuraciones: [],
      };

      const _listados = contenedor.sub_conf.filter(
        (sc) => sc.tipo.id === 2
      ) as SConf[];
      const _vistas = contenedor.sub_conf.filter(
        (sc) => sc.tipo.id === 6
      ) as SConf[];

      const _listadosArmados = await Promise.all(
        _listados.map(async (listado) => {
          return await ConfBuilder.armarListado(
            ctx,
            listado,
            contenedor,
            bouncer,
            queryFiltros,
            id,
            usuario,
            "n"
          );
        })
      );

      const _vistasArmadas = await Promise.all(
        _vistas.map(async (vista) => {
          return ConfBuilder.armarVista(
            ctx,
            vista,
            id,
            contenedor,
            bouncer,
            usuario
          );
        })
      );

      p.opciones["orden"] = conf?.orden.find(
        (o) => o.id_conf_h === contenedor?.id
      )?.orden;

      p.configuraciones = [];
      p.configuraciones = p.configuraciones.concat(_listadosArmados);
      p.configuraciones = p.configuraciones.concat(_vistasArmadas);

      return p;
    }
    if (conf.tipo.id === 9) {
      console.log("pidioABM", conf.id_a);
      return ConfBuilder.armarABM({ ctx, conf, abm: conf });
    }
  }

  public async ConfigPantalla(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;
    const config = request.params().pantalla;
    const usuario = await auth.authenticate();

    const id_a_solicitados = request.body();

    const id = id_a_solicitados.id;

    const queryFiltros = request.qs(); // siempre undefined porque pasamos todo por post

    if (!config) {
      return respuestaVacia;
    }

    const conf = await SConf.query()
      .where("id_a", config)
      .andWhere("id_tipo", 1)
      .preload("conf_permiso")
      .preload("tipo")
      .preload("orden")
      .preload("valores", (query) => query.preload("atributo"))
      .preload("sub_conf", (query) => preloadRecursivo(query))
      .firstOrFail();

    ctx.$_conf.estructura = conf;
    // para listado
    if (!(await bouncer.allows("AccesoConf", conf))) return respuestaVacia;

    const listados = conf.sub_conf.filter((sc) => sc.tipo.id === 2) as SConf[];
    const vistas = conf.sub_conf.filter((sc) => sc.tipo.id === 6) as SConf[];
    const abms = conf.sub_conf.filter((sc) => sc.tipo.id === 9) as SConf[];
    const contenedores = conf.sub_conf.filter(
      (sc) => sc.tipo.id === 7
    ) as SConf[];

    try {
      ctx.$_respuesta = respuestaVacia;

      const listadosArmados = await Promise.all(
        listados.map(async (listado) => {
          let solo_conf = "s";
          if (listado.getAtributo({ atributo: "iniciar_activo" }) === "s") {
            solo_conf = "n";
          }
          return await ConfBuilder.armarListado(
            ctx,
            listado,
            conf,
            bouncer,
            queryFiltros,
            id_a_solicitados.id,
            usuario,
            solo_conf
          );
        })
      );

      const vistasArmadas = await Promise.all(
        vistas.map(async (vista) => {
          return ConfBuilder.armarVista(ctx, vista, id, conf, bouncer, usuario);
        })
      );

      const contenedoresArmadas = await Promise.all(
        contenedores.map(async (contenedor) =>
          ConfBuilder.armarContenedor({
            ctx,
            idVista: id,
            idListado: id,
            contenedor,
          })
        )
      );

      const abmsArmados = await Promise.all(
        abms.map(async (abm) => {
          return ConfBuilder.armarABM({ ctx, conf, abm });
        })
      );

      ctx.$_respuesta.opciones = ConfBuilder.setOpciones(ctx, conf, conf, id);

      let configuraciones: any[] = [];
      configuraciones = configuraciones.concat(listadosArmados);
      configuraciones = configuraciones.concat(vistasArmadas);
      configuraciones = configuraciones.concat(contenedoresArmadas);
      configuraciones = configuraciones.concat(abmsArmados);

      ctx.$_respuesta.configuraciones = configuraciones;
      ctx.$_respuesta.error = ctx.$_errores[0]?.error;
      ctx.$_respuesta.sql = (await ctx.bouncer.allows("AccesoRuta", "GET_SQL"))
        ? ctx.$_sql
        : undefined;
      return ctx.$_respuesta;
    } catch (err) {
      return err;
    }
  }

  public async ABM_put(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;
    const config = request.params().config;

    const usuario = await auth.authenticate();
    const id = request.body().id;
    const formData = request.body();

    console.log("ABM PUT", request.body(), config);

    if (!config) {
      return respuestaVacia;
    }

    const conf = await SConf.query()
      .where("id_a", config)
      .andWhere("id_tipo", 1)
      .preload("conf_permiso")
      .preload("tipo")
      .preload("orden")
      .preload("valores", (query) => query.preload("atributo"))
      .preload("sub_conf", (query) => preloadRecursivo(query))
      .firstOrFail();

    ctx.$_conf.estructura = conf;

    if (!(await bouncer.allows("AccesoConf", conf)))
      return response.status(409);

    if (id) return;
    if (!id) {
      await insertarABM(ctx, formData, conf);
    }

    return "GUARDASTE CAPO";
  }

  public async Update(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;
    const { valor, update_id, id_a } = request.body();

    try {
      const usuario = await auth.authenticate();

      const config = await SConf.query()
        .where("id_a", id_a)
        .preload("conf_permiso")
        .preload("tipo")
        .preload("orden")
        .preload("valores", (query) => query.preload("atributo"))
        .preload("sub_conf", (query) => preloadRecursivo(query))
        .firstOrFail();

      if (!config) return "No hay tal configuracion";

      if (!(await bouncer.allows("AccesoConf", config, acciones.modificar)))
        return "No tiene permisos para esta config";

      const res = await modificar(ctx, update_id, valor, config, usuario);

      if (res?.modificado) {
        return response.accepted(res?.registroModificado);
      }
      return response.badRequest(res);
    } catch (err) {
      console.log(err);
      return;
    }
  }

  public async Insert(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;
    const { valor, insert_ids, id_a } = request.body();

    try {
      const usuario = await auth.authenticate();
      const config = await SConf.query()
        .where("id_a", id_a)
        .preload("conf_permiso")
        .preload("tipo")
        .preload("orden")
        .preload("valores", (query) => query.preload("atributo"))
        .preload("sub_conf", (query) => preloadRecursivo(query))
        .firstOrFail();

      if (!config) return "No hay tal configuracion";

      if (!(await bouncer.allows("AccesoConf", config, acciones.alta)))
        return "No tiene permisos para esta config";

      const res = await insertar(ctx, valor, insert_ids, config, usuario);

      if (res?.creado || res?.modificado) {
        return response.accepted(
          res.registroCreado ? res.registroCreado : res.registroModificado
        );
      }
      return response.badRequest(res);
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public async Delete(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;
    const { id_a, delete_id } = request.body();

    try {
      const usuario = await auth.authenticate();
      const config = await SConf.query()
        .where("id_a", id_a)
        .preload("conf_permiso")
        .preload("tipo")
        .preload("orden")
        .preload("valores", (query) => query.preload("atributo"))
        .preload("sub_conf", (query) => preloadRecursivo(query))
        .firstOrFail();

      if (!config) return "No hay tal configuracion";

      if (!(await bouncer.allows("AccesoConf", config, acciones.baja)))
        return "No tiene permisos para esta config";

      const res = await eliminar(ctx, delete_id, config, usuario);

      if (res?.eliminado) {
        return response.accepted(res?.registroEliminado);
      }
      return response.badRequest(res);
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}

const respuestaVacia: respuesta = {
  configuraciones: [],
  opciones: {},
  error: {},
};

const listadoVacio: listado = {
  datos: [{}],
  cabeceras: [{}],
  filtros: [{}],
  listadoBotones: [{}],
  opciones: {},
  error: { message: "" },
};

export interface respuesta {
  configuraciones: any[];
  opciones: {};
  error: {};
}