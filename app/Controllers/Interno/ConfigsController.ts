// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import SConf from "App/Models/SConf";

export default class ConfigsController {
  public async Config({ config }: { config: string }) {
    const conf = await SConf.query()
      .where("id_a", config)
      .preload("conf_permiso")
      .preload("tipo")
      .firstOrFail();

    return conf;
  }
}
