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
  public static async Config({ config }: { config: string }) {
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

    // eval(modelo);

    console.log(typeof eval(modelo));

    return await eval(modelo).query().select("nombre");
  }
}
