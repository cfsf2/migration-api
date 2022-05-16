// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";

let Servicio = S;

const preloadRecursivo = (query) => {
  return query
    .preload("conf_permiso")
    .preload("tipo")
    .preload("valores", (query) => query.preload("atributo"))
    .preload("sub_conf", (query) => preloadRecursivo(query));
};

export default class ConfigsController {
  public async Config({ request }) {
    const config = request.qs().pantalla;

    const conf = await SConf.query()
      .where("id_a", config)
      .andWhere("id_tipo", 1)
      .preload("conf_permiso")
      .preload("tipo")
      .preload("valores", (query) => query.preload("atributo"))
      .preload("sub_conf", (query) => preloadRecursivo(query))
      .firstOrFail();

    const modelo = conf.sub_conf
      .find((sc) => sc.tipo.id === 2)
      ?.valores.find((val) => val.atributo.find((a) => a.id === 15))
      ?.toObject().valor;

    const columnas = conf.sub_conf
      .find((sc) => sc.tipo.id === 2)
      ?.sub_conf.map((sc) => {
        if (sc.tipo.id === 4) {
          return sc;
        }
      });

    const campos = columnas?.map((col) => {
      return col?.valores.find((v) => v.atributo[0].id === 7)?.valor;
    });

    const cabeceras = columnas?.map((col) => {
      let cabecera = {};

      col?.valores.forEach((val) => {
        cabecera[val.atributo[0].nombre] = val.valor;
      });
      return cabecera;
    });

    const datos = await eval(modelo).query().select(campos);
    return { datos, cabeceras };
  }
}
