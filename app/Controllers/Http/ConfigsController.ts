import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import {
  armarListado,
  armarVista,
  listado,
  vista,
  modificar,
  insertar,
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
  public async Config({ request, bouncer, auth }: HttpContextContract) {
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

    // para listado
    if (!(await bouncer.allows("AccesoConf", conf))) return listadoVacio;

    if (conf.tipo.id === 2) {
      console.log("pidio Listado");
      try {
        return armarListado(conf, conf, bouncer, queryFiltros, id, usuario);
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    if (conf.tipo.id === 6) {
      console.log("pidio Vista");
      try {
        return armarVista(conf, id, conf, bouncer, usuario);
      } catch (err) {
        console.log(err);
        return err;
      }
    }
  }

  public async ConfigPantalla({ request, bouncer, auth }: HttpContextContract) {
    const config = request.params().pantalla;
    const usuario = await auth.authenticate();

    const id_a_solicitados = request.body();

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

    // para listado
    if (!(await bouncer.allows("AccesoConf", conf))) return respuestaVacia;

    const listados = conf.sub_conf.filter((sc) => sc.tipo.id === 2) as SConf[];
    const vistas = conf.sub_conf.filter((sc) => sc.tipo.id === 6) as SConf[];
    const pantallas = conf.sub_conf.filter((sc) => sc.tipo.id === 1) as SConf[];

    try {
      const respuesta: respuesta = respuestaVacia;

      const listadosArmados = await Promise.all(
        listados.map(async (listado) => {
          return await armarListado(
            listado,
            conf,
            bouncer,
            queryFiltros,
            id_a_solicitados.id,
            usuario
          );
        })
      );

      const vistasArmadas = await Promise.all(
        vistas.map(async (vista) => {
          return armarVista(vista, id_a_solicitados.id, conf, bouncer, usuario);
        })
      );

      const pantallasArmadas = await Promise.all(
        pantallas.map(async (pantalla) => {
          const p: {
            opciones: {};
            configuraciones: any[];
          } = {
            opciones: { id_a: pantalla.id_a, tipo: pantalla.tipo },
            configuraciones: [],
          };

          const _listados = pantalla.sub_conf.filter(
            (sc) => sc.tipo.id === 2
          ) as SConf[];
          const _vistas = pantalla.sub_conf.filter(
            (sc) => sc.tipo.id === 6
          ) as SConf[];

          const _listadosArmados = await Promise.all(
            _listados.map(async (listado) => {
              return await armarListado(
                listado,
                pantalla,
                bouncer,
                queryFiltros,
                id_a_solicitados.id,
                usuario
              );
            })
          );

          const _vistasArmadas = await Promise.all(
            _vistas.map(async (vista) => {
              return armarVista(
                vista,
                id_a_solicitados.id,
                pantalla,
                bouncer,
                usuario
              );
            })
          );

          p.opciones["orden"] = conf?.orden.find(
            (o) => o.id_conf_h === pantalla?.id
          )?.orden;

          p.configuraciones = [];
          p.configuraciones = p.configuraciones.concat(_listadosArmados);
          p.configuraciones = p.configuraciones.concat(_vistasArmadas);

          return p;
        })
      );

      conf?.valores.forEach((val) => {
        respuesta.opciones[val.atributo[0].nombre] = val.valor;
      });

      respuesta.opciones["id_a"] = conf.id_a;

      let configuraciones: any[] = [];
      configuraciones = configuraciones.concat(listadosArmados);
      configuraciones = configuraciones.concat(vistasArmadas);
      configuraciones = configuraciones.concat(pantallasArmadas);

      respuesta.configuraciones = configuraciones;

      return respuesta;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public async Update({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
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

      const res = await modificar(update_id, valor, config, usuario);

      if (res?.modificado) {
        return response.accepted(res?.registroModificado);
      }
      return response.badRequest(res);
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public async Insert({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
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

      const res = await insertar(valor, insert_ids, config, usuario);

      if (res?.creado) {
        return response.accepted(res?.registroCreado);
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
};

const listadoVacio: listado = {
  datos: [],
  cabeceras: [],
  filtros: [],
  opciones: {},
};

export interface respuesta {
  configuraciones: any[];
  opciones: {};
}
