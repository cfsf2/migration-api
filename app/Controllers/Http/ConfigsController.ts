// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";

let Servicio = S;
let Farmacia = F;

const preloadRecursivo = (query) => {
  return query
    .preload("conf_permiso", (query) => query.preload("permiso"))
    .preload("tipo")
    .preload("orden")
    .preload("valores", (query) => query.preload("atributo"))
    .preload("sub_conf", (query) => preloadRecursivo(query));
};

const verificarPermisos = async (listado: SConf, bouncer: any, tipoId) => {
  const sconfs_pedidos = listado?.sub_conf.filter(
    (sc) => sc.tipo.id === tipoId
  );
  const sconf_habilitados = await Promise.all(
    sconfs_pedidos?.map(async (sc) => {
      if (!(await bouncer.allows("AccesoConf", sc)))
        return false as unknown as SConf;
      return sc;
    })
  );

  return sconf_habilitados?.filter((f) => f);
};

const aplicarFiltros = (
  queryFiltros: {},
  query: any,
  filtros_e: SConf[], // filtros para los que tiene permiso
  listado: SConf
) => {
  //aplica filtros por defecto
  const filtros_solicitados = Object.keys(queryFiltros);
  const filtros_default = listado?.sub_conf
    .filter((sc) => sc.tipo.id === 3)
    .filter((filtro_d) => {
      return !filtros_solicitados.includes(filtro_d.id_a);
    });

  filtros_default.forEach((fd) => {
    let valordefault = fd?.valores.find((v) => {
      return v.atributo[0].nombre === "default";
    })?.valor;

    if (!valordefault) return;

    const campo = fd?.valores.find((v) => {
      return v.atributo[0].nombre === "campo";
    })?.valor;

    const operador = fd?.valores.find((v) => {
      return v.atributo[0].nombre === "operador";
    })?.valor;

    if (operador === "like") valordefault = valordefault?.concat("%");

    query.where(campo, operador ? operador : "=", valordefault);
  });

  //aplica filtros solicitados
  const filtros_solicitados_id_a = Object.keys(queryFiltros).filter((k) => {
    if (queryFiltros[k] === "null") return false;
    if (queryFiltros[k] === "undefined") return false;
    return !!queryFiltros[k].trim();
  });

  filtros_solicitados_id_a.forEach((id_a) => {
    const filtro = filtros_e.find((fil) => fil.id_a === id_a);

    if (!filtro) return;

    const campo = filtro?.valores.find((v) => {
      return v.atributo[0].nombre === "campo";
    })?.valor;

    const operador = filtro?.valores.find((v) => {
      return v.atributo[0].nombre === "operador";
    })?.valor;

    if (operador === "like")
      queryFiltros[id_a] = queryFiltros[id_a].concat("%");

    query.where(campo, operador ? operador : "=", queryFiltros[id_a]);
  });

  return query;
};

const armarListado = async (
  listado: SConf,
  conf: SConf,
  bouncer: any,
  queryFiltros: any
) => {
  let opcionesListado = {};
  let datos = [];

  if (!(await bouncer.allows("AccesoConf", listado))) return;

  listado?.valores.forEach((val) => {
    opcionesListado[val.atributo[0].nombre] = val.valor;
  });

  opcionesListado["orden"] = conf?.orden.find(
    (o) => o.id_conf_h === listado?.id
  )?.orden;

  const modelo = listado?.valores
    .find((val) => val.atributo.find((a) => a.id === 15))
    ?.toObject().valor;

  let columnas = await verificarPermisos(listado, bouncer, 4);
  let filtros_aplicables = await verificarPermisos(listado, bouncer, 3);

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

    cabecera["id_a"] = col.id_a;

    col?.valores.forEach((val) => {
      cabecera[val.atributo[0].nombre] = val.valor;
    });
    return cabecera;
  });

  const filtros = filtros_aplicables?.map((fil) => {
    let filters = {};

    filters["orden"] = listado?.orden.find(
      (o) => o.id_conf_h === fil.id
    )?.orden;

    filters["id_a"] = fil.id_a;

    fil?.valores.forEach((val) => {
      filters[val.atributo[0].nombre] = val.valor;
    });
    return filters;
  });

  if (campos.length !== 0) {
    let query = eval(modelo).query().select(campos);

    datos = await aplicarFiltros(
      queryFiltros,
      query,
      filtros_aplicables,
      listado
    );
  }

  return { datos, cabeceras, filtros, opcionesListado, conf };
};

export default class ConfigsController {
  public async Config({ request, bouncer }) {
    const config = request.qs().pantalla;
    const queryFiltros = request.qs();
    console.log(queryFiltros);

    if (!config) {
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

    const listado = conf.sub_conf.find((sc) => sc.tipo.id === 2) as SConf;

    return armarListado(listado, conf, bouncer, queryFiltros);
  }
}
