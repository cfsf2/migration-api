import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import {
  armarListado,
  armarVista,
  listado,
  vista,
} from "App/Helper/configuraciones";
import SConf from "App/Models/SConf";

const preloadRecursivo = (query) => {
  return query
    .preload("conf_permiso", (query) => query.preload("permiso"))
    .preload("tipo")
    .preload("orden")
    .preload("valores", (query) => query.preload("atributo"))
    .preload("sub_conf", (query) => preloadRecursivo(query));
};

export default class ConfigsController {
  public async Config({ request, bouncer }: HttpContextContract) {
    const config = request.qs().pantalla;
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
        return armarListado(conf, conf, bouncer, queryFiltros);
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    if (conf.tipo.id === 6) {
      console.log("pidio Vista");
      try {
        return armarVista(conf, request.body().id, conf, bouncer);
      } catch (err) {
        console.log(err);
        return err;
      }
    }
  }

  public async ConfigPantalla({ request, bouncer }: HttpContextContract) {
    const config = request.params().pantalla;

    const id_a_solicitados = request.body(); // como hago para recibir varios ids para distintas vistas y como se a que vista corresponde cada id??

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

    try {
      const respuesta: respuesta = respuestaVacia;

      const listadosArmados = await Promise.all(
        listados.map(async (listado) => {
          return await armarListado(listado, conf, bouncer, id_a_solicitados);
        })
      );

      const vistasArmadas = await Promise.all(
        vistas.map(async (vista) => {
          return armarVista(vista, id_a_solicitados.id, conf, bouncer);
        })
      );

      conf?.valores.forEach((val) => {
        respuesta.opciones[val.atributo[0].nombre] = val.valor;
      });

      let configuraciones: any[] = [];
      configuraciones = configuraciones.concat(listadosArmados);
      configuraciones = configuraciones.concat(vistasArmadas);

      respuesta.configuraciones = configuraciones;

      return respuesta;
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
