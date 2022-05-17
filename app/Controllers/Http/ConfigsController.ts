// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";

let Servicio = S;

const preloadRecursivo = (query) => {
  return query
    .preload("conf_permiso")
    .preload("tipo")
    .preload("orden")
    .preload("valores", (query) => query.preload("atributo"))
    .preload("sub_conf", (query) => preloadRecursivo(query));
};

export default class ConfigsController {
  public async Config({ request, bouncer }) {
    const config = request.qs().pantalla;

    console.log(config);
    if (!config) {
      console.log({ datos: [], cabeceras: [], filtros: [] });
      return { datos: [], cabeceras: [], filtros: [] };
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
    const listado = conf.sub_conf.find((sc) => sc.tipo.id === 2);
    console.log(listado?.toJSON());

    let opcionesListado = {};

    listado?.valores.forEach((val) => {
      opcionesListado[val.atributo[0].nombre] = val.valor;
    });

    opcionesListado["orden"] = conf?.orden.find(
      (o) => o.id_conf_h === listado?.id
    )?.orden;

    const modelo = listado?.valores
      .find((val) => val.atributo.find((a) => a.id === 15))
      ?.toObject().valor;

    const columnas = listado?.sub_conf.filter((sc) => sc.tipo.id === 4);

    const campos = columnas
      ?.map((col) => {
        return col?.valores.find((v) => v.atributo[0].id === 7)?.valor;
      })
      .filter((c) => c);

    const cabeceras = columnas?.map((col) => {
      let cabecera = {};

      cabecera["orden"] = listado?.orden.find(
        (o) => o.id_conf_h === col.id
      )?.orden;

      col?.valores.forEach((val) => {
        cabecera[val.atributo[0].nombre] = val.valor;
      });
      return cabecera;
    });

    const filtros_aplicables = listado?.sub_conf.filter(
      (sc) => sc.tipo.id === 3
    );

    const filtros = filtros_aplicables?.map((fil) => {
      let filters = {};

      filters["orden"] = listado?.orden.find(
        (o) => o.id_conf_h === fil.id
      )?.orden;

      fil?.valores.forEach((val) => {
        filters[val.atributo[0].nombre] = val.valor;
      });
      return filters;
    });

    const datos = await eval(modelo).query().select(campos);
    // console.log(conf.toJSON());
    return { datos, cabeceras, filtros, opcionesListado };
  }
}
