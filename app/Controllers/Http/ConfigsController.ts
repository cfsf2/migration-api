// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";
import { DateTime } from "luxon";

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

const extraerElementos = ({
  sc_hijos,
  sc_padre,
}: {
  sc_hijos: SConf[];
  sc_padre: SConf;
}) => {
  return sc_hijos.map((c: SConf) => {
    let item = {};
    item["orden"] =
      sc_padre.orden.find((o) => o.id_conf_h === c.id)?.orden ?? 0;

    item["id_a"] = c.id_a;

    c.valores.forEach(async (val) => {
      //console.log(val.atributo[0].nombre, val.valor);
      if (val.sql === "s" && val.valor && val.valor.trim() !== "") {
        return (item[val.atributo[0].nombre] = await Database.rawQuery(
          val.valor
        ))[0];
      }
      item[val.atributo[0].nombre] = val.valor;
    });

    item["elementos"] = extraerElementos({
      sc_hijos: c.sub_conf,
      sc_padre: c,
    });

    return item;
  });
};

const getLeftJoins = ({
  columnas,
  listado,
}: {
  columnas: SConf[];
  listado: SConf;
}): string[] => {
  let leftJoins = [];
  const confs = columnas.concat(listado);
  confs?.forEach((conf) =>
    leftJoins.push(
      conf?.valores.find((v) => v.atributo[0].id === 11)?.valor.trim() as never
    )
  );
  // leftJoins.push(
  //   listado.valores.find((v) => v?.atributo[0].id === 11)?.valor.trim() as never
  // );
  return Array.from(new Set(leftJoins.filter((c) => c)));
};

interface gp {
  groupBy: string;
  having: string;
}

const getOrder = (listado: SConf) => {
  let orders = [];
  const confs = [listado];
  confs?.forEach((conf) =>
    orders.push(
      conf?.valores.find((v) => v.atributo[0].id === 9)?.valor.trim() as never
    )
  );
  // orders.push(
  //   listado.valores.find((v) => v?.atributo[0].id === 11)?.valor.trim() as never
  // );
  return Array.from(new Set(orders.filter((c) => c)));
};

const getGroupBy = ({
  columnas,
  listado,
}: {
  columnas: SConf[];
  listado: SConf;
}): gp[] => {
  let groupsBy: gp[] = [];
  const confs = columnas.concat(listado);
  confs?.forEach((conf) => {
    let gp: gp = { groupBy: "", having: "" };
    gp.groupBy = conf?.valores
      .find((v) => v.atributo[0].id === 23)
      ?.valor.trim() as never;
    gp.having = conf?.valores
      .find((v) => v.atributo[0].id === 24)
      ?.valor.trim() as never;

    groupsBy.push(gp);
  });

  // [listado].forEach((l) => {
  //   let gp: gp = { groupBy: "", having: "" };
  //   gp.groupBy = l.valores
  //     .find((v) => v?.atributo[0].id === 23)
  //     ?.valor.trim() as never;
  //   gp.having = l.valores
  //     .find((v) => v?.atributo[0].id === 24)
  //     ?.valor.trim() as never;
  //   groupsBy.push(gp);
  // });

  return Array.from(new Set(groupsBy.filter((c) => c.groupBy)));
};

const aplicaWhere = async (
  query: DatabaseQueryBuilderContract,
  campo: string,
  operador: string,
  valor: string
) => {
  if (operador === "like") valor = valor?.concat("%");

  if (operador === "fecha" || operador === "fecha_hora") {
    const fechas = valor.split(",");
    if (fechas.length !== 2) return;

    const desde = DateTime.fromISO(fechas[0]).toSQL();
    const hasta = DateTime.fromISO(fechas[1])
      .set(operador === "fecha_hora" ? {} : { hour: 23, minute: 59 })
      .toSQL();

    query
      .where(campo, ">=", desde)
      .andWhere(campo, "<=", hasta)
      .orderBy(campo, "desc");
    //.whereNotNull(campo);
    return query;
  }

  if (operador === "fecha_simple") {
    // const fechas = valor.split(",");

    const fecha = DateTime.fromISO(valor).toSQL();

    query.where(campo, operador, fecha).orderBy(campo, "desc");
    //.whereNotNull(campo);
    return query;
  }

  query.where(campo, operador ? operador : "=", valor);

  return query;
};

const aplicarFiltros = (
  queryFiltros: {},
  query: DatabaseQueryBuilderContract,
  filtros_e: SConf[], // filtros para los que tiene permiso
  listado: SConf
) => {
  //aplica filtros obligatorios de listado
  const where = listado.valores.find(
    (v) => v.atributo[0].nombre === "where"
  )?.valor;

  if (where) {
    query.whereRaw(where);
  }
  //aplica filtros por defecto
  const filtros_solicitados = Object.keys(queryFiltros);
  const filtros_default = filtros_e.filter((filtro_d) => {
    return !filtros_solicitados.includes(filtro_d.id_a);
  });

  filtros_default.forEach((fd) => {
    let valordefault = fd?.valores.find((v) => {
      return v.atributo[0].nombre === "default";
    })?.valor;

    if (!valordefault) return;

    const campo = fd?.valores.find((v) => {
      return v.atributo[0].nombre === "campo";
    })?.valor as string;

    const operador = fd?.valores.find((v) => {
      return v.atributo[0].nombre === "operador";
    })?.valor as string;

    aplicaWhere(query, campo, operador, valordefault);
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
    })?.valor as string;

    const operador = filtro?.valores.find((v) => {
      return v.atributo[0].nombre === "operador";
    })?.valor as string;

    aplicaWhere(query, campo, operador, queryFiltros[id_a]);
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
  let opcionesPantalla = {};
  let datos = [];
  let sql = "";

  if (!(await bouncer.allows("AccesoConf", listado))) return;

  conf?.valores.forEach((val) => {
    opcionesPantalla[val.atributo[0].nombre] = val.valor;
  });

  listado?.valores.forEach((val) => {
    opcionesListado[val.atributo[0].nombre] = val.valor;
  });

  opcionesListado["orden"] = conf?.orden.find(
    (o) => o.id_conf_h === listado?.id
  )?.orden;

  opcionesListado["id_a"] = listado.id_a;

  let columnas = await verificarPermisos(listado, bouncer, 4);
  let filtros_aplicables = await verificarPermisos(listado, bouncer, 3);

  const modelo = listado?.valores
    .find((val) => val.atributo.find((a) => a.id === 15))
    ?.toObject().valor;

  const campos = columnas
    ?.map((col) => {
      return col?.valores.find((v) => v.atributo[0].id === 7)?.valor;
    })
    .filter((c) => c);

  const leftJoins: string[] = getLeftJoins({ columnas, listado });
  const groupsBy: gp[] = getGroupBy({ columnas, listado });
  const order = getOrder(listado);

  const cabeceras = extraerElementos({
    sc_hijos: columnas,
    sc_padre: listado,
  });

  const filtros = extraerElementos({
    sc_hijos: filtros_aplicables,
    sc_padre: listado,
  });

  if (campos.length !== 0) {
    let query = eval(modelo).query().select(campos);

    // aplicarPreloads - left join
    if (leftJoins.length > 0) {
      leftJoins.forEach((leftJoin) => {
        query.joinRaw(leftJoin);
      });
    }
    // aplicar groupsBy
    if (groupsBy.length > 0) {
      groupsBy.forEach(({ groupBy, having }) => {
        query.groupBy(groupBy);
        if (having) query.having(having);
      });
    }
    // aplicar order del listado
    if (order.length > 0) {
      order.forEach((order) => {
        query.orderBy(order, "desc");
      });
    }

    //aplicarFiltros
    if (await bouncer.allows("AccesoRuta", "GET_SQL")) sql = query.toQuery();

    query = aplicarFiltros(queryFiltros, query, filtros_aplicables, listado); //.paginate(1, 15);

    datos = await query;
  }

  return {
    cabeceras,
    filtros,
    opcionesListado,
    opcionesPantalla,
    datos,
    conf,
    sql,
  };
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

//leftjoins
// Array.from(
//   new Set(
//     columnas
//       ?.map((col) => {
//         return col?.valores
//           .find((v) => v.atributo[0].id === 11)
//           ?.valor.trim();
//       })
//       .filter((c) => c)
//   )
// );
