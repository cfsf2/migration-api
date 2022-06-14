import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";
import { DateTime } from "luxon";
import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import FS from "App/Models/FarmaciaServicio";

let Servicio = S;
let Farmacia = F;
let FarmaciaServicio = FS;
let _SConf = SConf;

const verificarPermisos = async (conf: SConf, bouncer: any, tipoId) => {
  const sconfs_pedidos = conf
    .toJSON()
    .sub_conf.filter((sc) => sc.tipo.id === tipoId);

  const sconf_habilitados = (
    await Promise.all(
      sconfs_pedidos.map(async (sc) => {
        if (!(await bouncer.allows("AccesoConf", sc))) {
          return false;
        }

        sc.sub_conf = await verificarPermisoConf(sc.sub_conf, bouncer);

        return sc;
      })
    )
  )?.filter((c) => c);

  return sconf_habilitados;
};

const verificarPermisosHijos = async (conf: SConf, bouncer: any) => {
  const sconfs_pedidos = conf.toJSON().sub_conf;

  const sconf_habilitados = (
    await Promise.all(
      sconfs_pedidos.map(async (sc) => {
        if (!(await bouncer.allows("AccesoConf", sc))) {
          return false;
        }

        sc.sub_conf = await verificarPermisoConf(sc.sub_conf, bouncer);

        return sc;
      })
    )
  )?.filter((c) => c);

  return sconf_habilitados;
};

const verificarPermisoConf = async (sub_confs, bouncer) => {
  const sc = (
    await Promise.all(
      sub_confs.map(async (sch) => {
        const per = await bouncer.allows("AccesoConf", sch);
        if (!per) return per;

        if (sch.tipo.id === 5) {
          if (getAtributo({ atributo: "enlace_id_a", conf: sch })) {
            const conf = await SConf.findByOrFail(
              "id_a",
              getAtributo({ atributo: "enlace_id_a", conf: sch })
            );
            const tienePermisoDeDestino = await bouncer.allows(
              "AccesoConf",
              conf
            );
            if (!tienePermisoDeDestino) return false;
          }
        }

        sch.sub_conf = await verificarPermisoConf(sch.sub_conf, bouncer);

        return sch;
      })
    )
  )?.filter((c) => c);

  return sc;
};

const extraerElementos = ({
  sc_hijos,
  sc_padre,
  bouncer,
}: {
  sc_hijos: SConf[];
  sc_padre: SConf;
  bouncer: any;
}) => {
  return sc_hijos.map((c: SConf) => {
    let item = {};
    item["orden"] =
      sc_padre.orden.find((o) => o.id_conf_h === c.id)?.orden ?? 0;

    item["id_a"] = c.id_a;

    c.valores.forEach(async (val) => {
      //console.log(val.atributo[0].nombre, val.valor);
      const atributoNombre = val.atributo[0].nombre;

      if (val.evaluar === "s") {
        val.valor = eval(val.valor);
      }

      if (val.subquery === "s" && val.valor && val.valor.trim() !== "") {
        let lista = await Database.rawQuery(val.valor);
        return (item[atributoNombre] = lista[0]);
      }

      if (atributoNombre === "radio_labels") {
        const opciones = val.valor.split("|").map((op, i) => {
          return {
            label: op.trim(),
            value: i,
          };
        });
        item["radio_opciones"] = opciones;
      }

      if (atributoNombre === "enlace_id_a_opcional") {
        const conf = await SConf.findByOrFail("id_a", val.valor);
        const per = await bouncer.allows("AccesoConf", conf);

        if (!per) return (item[atributoNombre] = undefined);
        return (item["enlace_id_a"] = val.valor);
      }

      item[atributoNombre] = val.valor;
    });

    item["sc_hijos"] = extraerElementos({
      sc_hijos: c.sub_conf,
      sc_padre: c,
      bouncer,
    });

    return item;
  });
};

const getLeftJoins = ({
  columnas,
  conf,
}: {
  columnas: SConf[];
  conf: SConf;
}): string[] => {
  return getAtributosById([conf, columnas], 11);
};

interface gp {
  groupBy: string;
  having: string | undefined;
}

const getAtributosById = (sconfs: (SConf | SConf[])[], id: number): any[] => {
  const sc = sconfs.flat(10);

  let atributos = [];

  sc?.forEach((conf) => {
    atributos.push(
      conf?.valores.find((v) => v.atributo[0].id === id)?.valor.trim() as never
    );
    if (conf.sub_conf.length > 0) {
      conf.sub_conf.forEach((sc) =>
        atributos.push(
          sc?.valores
            .find((v) => v.atributo[0].id === id)
            ?.valor.trim() as never
        )
      );
    }
  });

  return Array.from(new Set(atributos.filter((c) => c))).flat(20);
};

const getOrder = (conf: SConf): string[] | number[] => {
  return getAtributosById([conf], 9);
};

const getGroupBy = ({
  columnas,
  conf,
}: {
  columnas: SConf[];
  conf: SConf;
}): gp[] => {
  let groupsBy: gp[] = [];
  const confs = columnas.concat(conf);
  confs?.forEach((confi) => {
    let gp: gp = { groupBy: "", having: "" };
    gp.groupBy = getAtributoById({ id: 23, conf: confi });
    gp.having = getAtributoById({ id: 24, conf: confi }) as string | undefined;

    groupsBy.push(gp);
  });

  return Array.from(new Set(groupsBy.filter((c) => c.groupBy)));
};

const getAtributo = ({
  atributo,
  conf,
}: {
  atributo: string;
  conf: SConf;
}): string => {
  return conf.valores.find((v) => {
    return v.atributo[0].nombre === atributo;
  })?.valor as string;
};

const getAtributoById = ({ id, conf }: { id: number; conf: SConf }): string => {
  return conf.valores.find((v) => v.atributo[0].id === id)?.valor as string;
};

const getFullAtributo = ({
  atributo,
  conf,
}: {
  atributo: string;
  conf: SConf;
}) => {
  return conf.valores.find((v) => v.atributo[0].nombre === atributo);
};

const getFullAtributoById = ({ id, conf }: { id: number; conf: SConf }) => {
  return conf.valores.find((v) => v.atributo[0].id === id);
};

const getFullAtributosBySQL = ({ conf }: { conf: SConf }) => {
  return conf.valores.filter((v) => v.sql === "s");
};

interface select {
  campo: string;
  sql: string;
  alias: string;
}

const getSelect = (sc_confs: (SConf | SConf[])[], id: number) => {
  let selects: any[] = [];
  const confs = sc_confs.flat(20);

  confs.forEach((conf) => {
    let select: select = { campo: "", sql: "", alias: "" };
    select.campo = getFullAtributoById({ id: id, conf })?.valor as string;
    select.sql = getFullAtributoById({ id: id, conf })?.sql as string;
    select.alias = getAtributo({ atributo: "campo_alias", conf })
      ? getAtributo({ atributo: "campo_alias", conf })
      : conf.id_a;
    selects.push(select);

    const valoresSQL = conf.valores.filter((v) => v.sql === "s");

    valoresSQL.forEach((v) => {
      let vselect: select = { campo: "", sql: "", alias: "" };
      vselect.campo = v.valor;
      vselect.sql = v.sql;
      vselect.alias = getAtributo({
        atributo: v.atributo[0].nombre.concat("_alias"),
        conf,
      });

      selects.push(vselect);
    });

    if (conf.sub_conf.length > 0) {
      selects.push(getSelect(conf.sub_conf, 7));
    }
  });
  return Array.from(new Set(selects.flat(20).filter((c) => c.campo)));
};

const aplicaWhere = async (
  query: DatabaseQueryBuilderContract,
  valor: string,
  conf: SConf
) => {
  const campo = getAtributoById({ id: 7, conf });

  const operador = getAtributo({ atributo: "operador", conf });

  const tipo = getAtributo({ atributo: "tipo", conf });

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

  if (tipo === "fecha_simple") {
    // const fechas = valor.split(",");

    const fecha = DateTime.fromISO(valor).toSQL();

    query.where(campo, operador ? operador : "=", fecha).orderBy(campo, "desc");
    //.whereNotNull(campo);
    return query;
  }

  if (tipo === "radio") {
    const radio_where_a = conf.valores
      .find((v) => v.atributo[0].nombre === "radio_where")
      ?.valor.split("|");

    const radio_where_o = Object.assign({}, radio_where_a);

    return query.whereRaw(radio_where_o[Number(valor)].trim());
  }

  query.where(campo, operador ? operador : "=", valor);

  return query;
};

const aplicarFiltros = (
  query: DatabaseQueryBuilderContract,
  configuracion: SConf,
  id?: number,
  queryFiltros?: {},
  filtros_e?: SConf[] // filtros para los que tiene permiso
) => {
  //aplica filtros obligatorios de configuracion
  const where = getFullAtributo({ conf: configuracion, atributo: "where" });

  if (where) {
    if (where.evaluar === "s") {
      return query.whereRaw(eval(where.valor));
    }
    query.whereRaw(where.valor);
  }

  if (typeof queryFiltros !== "undefined" && typeof filtros_e !== "undefined") {
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

      aplicaWhere(query, valordefault, fd);
    });

    //aplica filtros solicitados
    const filtros_solicitados_id_a = Object.keys(queryFiltros).filter((k) => {
      if (queryFiltros[k] === "null") return false;
      if (queryFiltros[k] === "undefined") return false;
      return !!queryFiltros[k]?.toString().trim();
    });

    filtros_solicitados_id_a.forEach((id_a) => {
      const filtro = filtros_e.find((fil) => fil.id_a === id_a);

      if (!filtro) return;

      aplicaWhere(query, queryFiltros[id_a], filtro);
    });
  }
  return query;
};

export const armarVista = async (
  vista: SConf,
  id: number,
  conf: SConf,
  bouncer: any
): Promise<vista> => {
  let opciones = {};
  let datos = [];
  let sql = "";

  let vistaFinal: vista = {
    opciones,
    datos,
    sql,
    cabeceras: [],
  };

  if (!(await bouncer.allows("AccesoConf", vista))) return vistaVacia;

  conf?.valores.forEach((val) => {
    opciones[val.atributo[0].nombre] = val.valor;
  });

  vista?.valores.forEach((val) => {
    opciones[val.atributo[0].nombre] = val.valor;
  });

  opciones["orden"] = conf?.orden.find((o) => o.id_conf_h === vista?.id)?.orden;
  opciones["tipo"] = vista.tipo;

  let columnas = await verificarPermisosHijos(vista, bouncer);

  vistaFinal.cabeceras = extraerElementos({
    sc_hijos: columnas,
    sc_padre: vista,
    bouncer,
  });

  const modelo = getAtributo({ atributo: "modelo", conf: vista });

  const campos = getSelect([columnas], 7);
  const leftJoins: string[] = getLeftJoins({ columnas, conf: vista });
  const groupsBy: gp[] = getGroupBy({ columnas, conf: vista });
  const order = getOrder(vista);

  if (campos.length !== 0 && id) {
    console.log("Vista ", vista.id_a, " buscando datos de id: ", id);
    // ARRANCA LA QUERY -----------=======================-------------QUERY-----------------========================---------------------------------
    // ARRANCA LA QUERY -----------=======================-------------QUERY-----------------========================---------------------------------
    // ARRANCA LA QUERY -----------=======================-------------QUERY-----------------========================---------------------------------
    const parametro = getAtributo({ atributo: "parametro", conf: vista });
    let query = eval(modelo).query().where(`${parametro}.id`, id);

    //aplicaSelects
    campos.forEach((campo) => {
      // console.log(campo);
      query.select(
        Database.raw(`${campo.campo} ${campo.alias ? "as " + campo.alias : ""}`)
      );
      //console.log(query.toSQL().sql);
    });

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

    query = aplicarFiltros(query, vista);

    vistaFinal.sql = query.toQuery();
    // console.log("vista sql: ", vistaFinal.sql);
    //await query.paginate(1, 15);

    vistaFinal.datos = await query;
  }

  return vistaFinal;
};

export const armarListado = async (
  listado: SConf,
  conf: SConf,
  bouncer: any,
  queryFiltros: any,
  id: number
) => {
  let opciones = {};
  let opcionesPantalla = {};
  let datos = [];
  let sql = "";

  if (!(await bouncer.allows("AccesoConf", listado))) return listadoVacio;

  conf?.valores.forEach((val) => {
    opcionesPantalla[val.atributo[0].nombre] = val.valor;
  });

  listado?.valores.forEach((val) => {
    opciones[val.atributo[0].nombre] = val.valor;
  });

  opciones["orden"] = conf?.orden.find(
    (o) => o.id_conf_h === listado?.id
  )?.orden;

  opciones["id_a"] = listado.id_a;
  opciones["tipo"] = listado.tipo;

  let columnas = await verificarPermisos(listado, bouncer, 4);
  let filtros_aplicables = await verificarPermisos(listado, bouncer, 3);

  const modelo = listado?.valores
    .find((val) => val.atributo.find((a) => a.id === 15))
    ?.toObject().valor;

  const campos = getSelect([columnas], 7);
  const leftJoins: string[] = getLeftJoins({ columnas, conf: listado });
  const groupsBy: gp[] = getGroupBy({ columnas, conf: listado });
  const order = getOrder(listado);

  const cabeceras = extraerElementos({
    sc_hijos: columnas,
    sc_padre: listado,
    bouncer,
  });

  const filtros = extraerElementos({
    sc_hijos: filtros_aplicables,
    sc_padre: listado,
    bouncer,
  });

  if (campos.length !== 0) {
    // ARRANCA LA QUERY -----------=======================-------------QUERY-----------------========================---------------------------------
    // ARRANCA LA QUERY -----------=======================-------------QUERY-----------------========================---------------------------------
    // ARRANCA LA QUERY -----------=======================-------------QUERY-----------------========================---------------------------------
    let query = eval(modelo).query();

    //aplicaSelects
    campos.forEach((campo) => {
      query.select(
        Database.raw(`${campo.campo} ${campo.alias ? "as " + campo.alias : ""}`)
      );
      //console.log(query.toSQL().sql);
    });

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

    query = aplicarFiltros(
      query,
      listado,
      id,
      queryFiltros,
      filtros_aplicables
    );

    sql = query.toQuery();
    // console.log("listado sql: ", sql);
    //await query.paginate(1, 15);

    datos = await query;
  }

  return {
    cabeceras,
    filtros,
    opciones,
    datos,
    sql: (await bouncer.allows("AccesoRuta", "GET_SQL")) ? sql : undefined,
    conf: (await bouncer.allows("AccesoRuta", "GET_SQL")) ? conf : undefined,
  };
};

const listadoVacio: listado = {
  datos: [],
  cabeceras: [],
  filtros: [],
  opciones: {},
};

const vistaVacia = {
  opciones: {},
  datos: [],
  sql: "",
  cabeceras: [],
};

export interface listado {
  datos: any[];
  cabeceras: any[];
  filtros: any[];
  opciones: {};
  sql?: string;
  conf?: SConf;
}

export interface vista {
  datos: any[];
  cabeceras: any[];
  opciones: {};
  sql?: string;
  conf?: SConf;
}
