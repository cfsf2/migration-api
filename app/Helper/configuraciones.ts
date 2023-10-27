import {
  DatabaseQueryBuilderContract,
  RawQuery,
} from "@ioc:Adonis/Lucid/Database";
import { DateTime } from "luxon";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { Permiso } from "./permisos";

import U from "./Update";
import I from "./Insertar";
import D from "./Eliminar";

import * as M from "./ModelIndex";
import Datab from "@ioc:Adonis/Lucid/Database";

import SConf from "App/Models/SConf";

import Usuario from "App/Models/Usuario";

const Database = Datab;

let Update = U;
let Insertar = I;
let Eliminar = D;

const verificarPermisos = async ({
  ctx,
  conf,
  bouncer,
  tipoId,
}: {
  ctx: HttpContextContract;
  conf: SConf;
  bouncer: any;
  tipoId: number;
}) => {
  const sconfs_pedidos = conf
    .toJSON()
    .sub_conf.filter((sc) => sc.tipo.id === tipoId);

  const sconf_habilitados = (
    await Promise.all(
      sconfs_pedidos.map(async (sc) => {
        if (!(await bouncer.allows("AccesoConf", sc))) {
          return false;
        }

        sc.sub_conf = await verificarPermisoConf({
          ctx,
          sub_confs: sc.sub_conf,
          bouncer,
        });

        return sc;
      })
    )
  )?.filter((c) => c);

  return sconf_habilitados;
};

const verificarPermisosHijos = async ({
  ctx,
  conf,
  bouncer,
}: {
  ctx: HttpContextContract;
  conf: SConf;
  bouncer: any;
}) => {
  const sconfs_pedidos = conf.toJSON().sub_conf;

  const sconf_habilitados = (
    await Promise.all(
      sconfs_pedidos.map(async (sc) => {
        if (!(await bouncer.allows("AccesoConf", sc))) {
          return false;
        }

        sc.sub_conf = await verificarPermisoConf({
          ctx,
          sub_confs: sc.sub_conf,
          bouncer,
        });

        return sc;
      })
    )
  )?.filter((c) => c);

  return sconf_habilitados;
};

const verificarPermisoConf = async ({ ctx, sub_confs, bouncer }) => {
  const sc = (
    await Promise.all(
      sub_confs.map(async (sch) => {
        const per = await bouncer.allows("AccesoConf", sch);
        if (!per) return per;

        if (sch.tipo.id === 5) {
          if (getAtributo({ atributo: "enlace_id_a", conf: sch })) {
            try {
              const conf = await M.SConf.findBy(
                "id_a",
                getAtributo({ atributo: "enlace_id_a", conf: sch })
              );

              await conf?.load("conf_permiso", (query) =>
                query.preload("permiso")
              );

              if (!conf)
                throw await new ExceptionHandler().handle(
                  { code: "E_ROW_NOT_FOUND", message: "error" },
                  ctx
                );
              const tienePermisoDeDestino = await bouncer.allows(
                "AccesoConf",
                conf
              );
              if (!tienePermisoDeDestino) return false;
            } catch (err) {
              console.log(
                "El error fue provocado por lo si guiente",
                err,
                getAtributo({ atributo: "enlace_id_a", conf: sch })
              );

              return await new ExceptionHandler().handle(err, ctx);
            }
          }
        }

        sch.sub_conf = await verificarPermisoConf({
          ctx,
          sub_confs: sch.sub_conf,
          bouncer,
        });

        return sch;
      })
    )
  )?.filter((c) => c);

  return sc;
};

const extraerElementos = ({
  ctx,
  sc_hijos,
  sc_padre,
  bouncer,
  usuario,
  datos = [],
  id,
}: {
  ctx: HttpContextContract;
  sc_hijos: SConf[];
  sc_padre: SConf;
  bouncer: any;
  usuario?: Usuario;
  datos?: any[];
  id?: number;
}) => {
  id;
  datos;
  return Promise.all(
    sc_hijos
      .map(async (sconf: SConf) => {
        let c = sconf;
        let item = {};
        let valor = ctx.request.qs()[c.id_a];
        valor;
        // Verificar Orden designado por usuario

        const configuracionDeUsuario = (() => {
          if (
            getAtributo({
              conf: sc_padre,
              atributo: "configuracion_usuario_activo",
            }) === "s"
          ) {
            return ctx.usuario.configuracionesDeUsuario[
              sc_padre.id_a
            ]?.detalles.find((cc) => cc.id_conf === c.id);
          }
          return {};
        })();

        item["orden"] = configuracionDeUsuario?.orden
          ? configuracionDeUsuario.orden
          : sc_padre.orden.find((o) => o.id_conf_h === c.id)?.orden ?? 0;

        item["mostrar"] = configuracionDeUsuario?.mostrar
          ? configuracionDeUsuario.mostrar
          : "s";

        if (
          ctx.usuario.configuracionesDeUsuario[sc_padre.id_a]
            ?.guardar_filtros === "s"
        ) {
          item["default"] = configuracionDeUsuario?.default
            ? configuracionDeUsuario.default
            : undefined;
        }

        item["id_a"] = c.id_a;
        item["id"] = c.id;

        await Promise.all(
          c.valores.map(async (val) => {
            //console.log(val.atributo[0].nombre, val.valor);
            const atributoNombre = val.atributo[0].nombre;

            if (val.evaluar === "s" && val.sql === "n") {
              val.valor = eval(val.valor);
            }

            if (val.subquery === "s" && val.valor && val.valor.trim() !== "") {
              let sinDependencia = true;
              // Caso Select Esclavo
              const maestroIda = getAtributo({
                atributo: "select_depende_de",
                conf: c,
              });
              if (maestroIda) {
                sinDependencia = false;
                const maestro = await SConf.findByIda({ id_a: maestroIda });
                const query = val.valor;
                val.valor = [] as unknown as string;
                const id_a_maestro = getAtributo({
                  atributo: "select_depende_de",
                  conf: c,
                });

                const condicionValor = ctx.request.qs()[id_a_maestro];

                if (condicionValor && maestro) {
                  const campoSelectMaestroWhere = getAtributo({
                    atributo: "select_es_maestro_campo",
                    conf: maestro,
                  });
                  val.valor =
                    query +
                    " where " +
                    campoSelectMaestroWhere +
                    "=" +
                    condicionValor;
                  sinDependencia = true;
                }
              }
              if (sinDependencia) {
                try {
                  let lista = await Database.rawQuery(val.valor);

                  ctx.$_sql.push({
                    sql: Database.rawQuery(val.valor).toQuery(),
                    conf: c.id_a,
                    confId: c.id,
                  });

                  val.valor = lista[0];
                } catch (err) {
                  err.id_a = c.id_a;

                  ctx.$_sql.push({
                    sql: Database.rawQuery(val.valor).toQuery(),
                    conf: c.id_a,
                    confId: c.id,
                    error: true,
                  });

                  return new ExceptionHandler().handle(err, ctx);
                }
              }
            }

            if (atributoNombre === "opciones") {
              const label_null = getAtributo({
                atributo: "select_label_null",
                conf: c,
              });
              const value_null = getAtributo({
                atributo: "select_value_null",
                conf: c,
              });
              const disabled = getAtributo({
                atributo: "select_default_disabled",
                conf: c,
              });

              if (label_null || value_null) {
                const opcion_null = {
                  value: value_null ? value_null : null,
                  label: label_null ? label_null : "Ninguno",
                  disabled: disabled === "true",
                };

                if (Array.isArray(val.valor)) val.valor.push(opcion_null);
              }
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

            if (atributoNombre === "radio_opciones_labels") {
              if (val.subquery === "s") return;
              const atrRadioOpcionesValores = getFullAtributo({
                atributo: "radio_opciones_valores",
                conf: sconf,
              }) as any;

              let valores = atrRadioOpcionesValores?.valor.split(
                "|"
              ) as string[];

              if (atrRadioOpcionesValores.evaluar === "s") {
                valores = valores.map((v) => {
                  return eval(v);
                });
              }

              const opciones = val.valor.split("|").map((op, i) => {
                let valor = valores[i] as any;
                if (typeof valor === "string") valor = valor.trim();

                const onlyNumbers = new RegExp("^[0-9]+$");
                if (onlyNumbers.test(valor)) {
                  valor = Number(valor);
                }
                return { label: op.trim(), value: valor };
              });

              return (item["radio_opciones"] = opciones);
            }

            if (atributoNombre === "enlace_id_a_opcional") {
              const conf = await M.SConf.findByOrFail("id_a", val.valor);
              const per = await bouncer.allows("AccesoConf", conf);

              if (!per) return (item[atributoNombre] = undefined);
              return (item["enlace_id_a"] = val.valor);
            }

            if (
              configuracionDeUsuario &&
              configuracionDeUsuario[atributoNombre] &&
              configuracionDeUsuario[atributoNombre] !== ""
            ) {
              return (item[atributoNombre] =
                configuracionDeUsuario[atributoNombre]);
            }
            item[atributoNombre] = val.valor;
          })
        );

        item["sc_hijos"] = await extraerElementos({
          ctx,
          sc_hijos: c.sub_conf,
          sc_padre: c,
          bouncer,
          usuario,
        });

        return item;
      })
      .filter((c) => c)
  );
};

const getLeftJoins = ({
  conf,
  ctx,
}: {
  columnas: SConf[];
  conf: SConf;
  ctx: HttpContextContract;
}): at[] => {
  let leftjoins: at[] = [];

  const getleft = (c, cp) => {
    const lj = getFullAtributoById({ id: 11, conf: c });
    const orden = cp?.orden?.filter((f) => f.id_conf_h === c.id)?.pop().orden;

    if (lj) {
      if ((c.id_tipo === 3 && ctx.request.qs()[c.id_a]) || c.id_tipo !== 3) {
        // si es un filtro no se aplica el left join a menos que sea solicitado
        leftjoins.push({
          valor: lj.valor,
          evaluar: lj.evaluar,
          orden: orden ?? 0,
          sql: lj.sql,
          subquery: lj.subquery,
        });
      }
    }

    c.sub_conf.forEach((sc) => {
      getleft(sc, c);
    });
  };
  getleft(conf, {});

  return leftjoins.sort((a, b) => a.orden - b.orden);
};

interface at {
  valor: string;
  orden: number;
  evaluar: string;
  subquery: string;
  sql: string;
}

interface gp {
  groupBy: string;
  having: string | undefined;
}

const getFullAtributosById = (
  sconfs: (SConf | SConf[])[],
  id: number
): any[] => {
  const sc = sconfs.flat(20);

  let atributos: (at | at[])[] = [];

  sc.forEach((conf, i) => {
    i;
    let atributo = { valor: "", sql: "", evaluar: "", subquery: "", orden: 0 };

    atributo.valor = conf?.valores
      .find((v) => v.atributo[0].id === id)
      ?.valor.trim() as string;
    atributo.sql = conf?.valores
      .find((v) => v.atributo[0].id === id)
      ?.sql.trim() as string;
    atributo.evaluar = conf?.valores
      .find((v) => v.atributo[0].id === id)
      ?.evaluar.trim() as string;
    atributo.subquery = conf?.valores
      .find((v) => v.atributo[0].id === id)
      ?.subquery.trim() as string;

    atributos.push(atributo);

    if (conf.sub_conf.length > 0) {
      atributos.push(getFullAtributosById(conf.sub_conf, id));
    }
  });

  return [...new Set(atributos.flat(20).map((s) => JSON.stringify(s)))]
    .map((s) => JSON.parse(s))
    .flat(20)
    .filter((c) => c.valor);
};

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

const getOrder = ({
  ctx,
  conf,
}: {
  ctx: HttpContextContract;
  conf: SConf;
}): string[] | number[] => {
  const usuarioOrder = ctx.usuario.configuracionesDeUsuario[conf.id_a]?.order;

  if (usuarioOrder && usuarioOrder.trim() !== "") {
    return [usuarioOrder];
  }
  return getAtributosById([conf], 9);
};

const getGroupBy = ({
  columnas,
  conf,
  usuario,
}: {
  columnas: SConf[];
  conf: SConf;
  usuario?: Usuario;
}): gp[] => {
  usuario;
  let groupsBy: gp[] = [];
  const confs = columnas.concat(conf);

  let gp: gp = { groupBy: "", having: "" };
  gp.groupBy = getAtributoById({ id: 23, conf: conf });
  gp.having = getAtributoById({ id: 24, conf: conf }) as string | undefined;
  groupsBy.push(gp);

  confs?.forEach((confi) => {
    let gp: gp = { groupBy: "", having: "" };
    gp.groupBy = getAtributoById({ id: 23, conf: confi });
    gp.having = getAtributoById({ id: 24, conf: confi }) as string | undefined;

    groupsBy.push(gp);
  });

  return Array.from(new Set(groupsBy.filter((c) => c.groupBy)));
};

export const getAtributo = ({
  atributo,
  conf,
}: {
  atributo: string;
  conf: SConf;
}): string => {
  if (!conf.valores) {
    console.log(
      "Configuracion no tiene valores?? No, te olvidaste los preload papu"
    );
    return "";
  }

  return conf.valores.find((v) => {
    if (!v.atributo[0]) {
      //  console.log(conf.id_a);
      //  console.log("ACA DEBE HABER UN ERROR", v, v.atributo, atributo, atributo);
    }
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

// const getFullAtributosBySQL = ({ conf }: { conf: SConf }) => {
//   return conf.valores.filter((v) => v.sql === "s");
// };

interface select {
  campo: string;
  sql: string;
  alias: string;
  evaluar: string;
  subquery: string;
  id_a: string;
  confId: number;
}

const getSelect = (
  ctx,
  sc_confs: (SConf | SConf[])[],
  id: number,
  usuario?: Usuario
) => {
  let selects: any[] = [];
  const confs = sc_confs.flat(20);

  confs.forEach((conf) => {
    let select: select = {
      campo: "",
      sql: "",
      alias: "",
      evaluar: "",
      subquery: "",
      id_a: conf.id_a,
      confId: conf.id,
    };

    select.campo = getFullAtributoById({ id: id, conf })?.valor as string;
    select.sql = getFullAtributoById({ id: id, conf })?.sql as string;
    select.evaluar = getFullAtributoById({ id: id, conf })?.evaluar as string;
    select.subquery = getFullAtributoById({ id: id, conf })?.subquery as string;
    select.alias = getAtributo({ atributo: "campo_alias", conf })
      ? getAtributo({ atributo: "campo_alias", conf })
      : conf.id_a;
    selects.push(select);

    const valoresSQL = conf.valores.filter((v) => v.sql === "s");

    valoresSQL.forEach((v) => {
      let vselect: select = {
        campo: v.valor,
        sql: v.sql,
        alias: "",
        evaluar: v.evaluar,
        subquery: v.subquery,
        id_a: conf.id_a,
        confId: conf.id,
      };

      vselect.alias =
        getAtributo({
          atributo: v.atributo[0].nombre.concat("_alias"),
          conf,
        }) ?? conf.id_a + "_" + v.atributo[0].nombre;

      if (v.atributo[0].nombre === "condicion_acceso") {
        vselect.alias = conf.id_a + "_CONDICION_ACCESO";
      }

      selects.push(vselect);
    });

    if (conf.sub_conf.length > 0) {
      selects.push(getSelect(ctx, conf.sub_conf, 7, usuario));
    }
  });
  return Array.from(new Set(selects.flat(20).filter((c) => c.campo)));
};

const aplicaWhere = async (
  query: DatabaseQueryBuilderContract,
  valor: string,
  conf: SConf,
  ctx: HttpContextContract
) => {
  ctx;
  const campo = getAtributoById({ id: 7, conf });

  const operador = getAtributo({ atributo: "operador", conf });

  const tipo = getAtributo({ atributo: "componente", conf });

  if (operador === "like" && valor) {
    const valores = valor.split(" ");

    valores.forEach((v) => {
      const $like = "%".concat(v + "%");
      query.where(campo, "like", $like);
    });
    return query;
  }

  if ((operador === "in" || operador === "IN") && valor) {
    const valores = valor.split(",");
    return query.whereIn(campo, valores);
  }

  if (operador === "fecha" || operador === "fecha_hora") {
    const fechas = JSON.parse(valor);

    if (fechas.length !== 2) return;

    const desde = DateTime.fromISO(fechas[0]).toSQL();
    const hasta = DateTime.fromISO(fechas[1])
      .set(operador === "fecha_hora" ? {} : { hour: 23, minute: 59 })
      .toSQL();

    query.where(campo, ">=", desde).andWhere(campo, "<=", hasta);
    //  .orderBy(campo, "desc");
    //  .whereNotNull(campo);

    return query;
  }

  if (tipo === "fecha_simple") {
    // const fechas = valor.split(",");

    const fecha = DateTime.fromISO(valor).toSQL();
    query.where(campo, operador ? operador : "=", fecha);
    //.orderBy(campo, "desc");
    //.whereNotNull(campo);
    return query;
  }

  if (tipo === "radio" && valor) {
    const radio_where_a = conf.valores
      .find((v) => v.atributo[0].nombre === "radio_where")
      ?.valor.split("|");

    const radio_where_o = Object.assign({}, radio_where_a);
    return query.whereRaw(radio_where_o[Number(valor)].trim());
  }

  if (operador === "raw") {
    //  console.log(conf.id_a);
    const whereRaw = getAtributo({ atributo: "where", conf });
    try {
      if (whereRaw) {
        //  console.log(whereRaw);
        return query.whereRaw(eval("`" + whereRaw + "`"));
      }
    } catch (err) {
      console.log(err);
    }
    return query;
  }

  query.where(campo, operador ? operador : "=", valor);

  return query;
};

const aplicarFiltros = (
  ctx: HttpContextContract,
  query: DatabaseQueryBuilderContract,
  configuracion: SConf,
  id?: number,
  queryFiltros?: {},
  filtros_e?: SConf[] // filtros para los que tiene permiso
) => {
  //aplica filtros obligatorios de configuracion
  id;
  const where = getFullAtributo({ conf: configuracion, atributo: "where" });

  if (where && where.valor.trim() !== "") {
    let thisWhere = where.valor;
    if (where.evaluar === "s") {
      thisWhere = eval(where.valor);
    }
    query.whereRaw(thisWhere);
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

      if (
        ctx.usuario.configuracionesDeUsuario[configuracion.id_a]
          ?.guardar_filtros === "s"
      ) {
        const usuarioDefault = ctx.usuario.configuracionesDeUsuario[
          configuracion.id_a
        ]?.detalles?.find((cc) => cc.id_conf === fd.id)?.default;

        if (usuarioDefault && usuarioDefault.trim() !== "") {
          valordefault = usuarioDefault;
        }
      }

      if (!valordefault) return;

      aplicaWhere(query, valordefault, fd, ctx);
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

      // const permiteNull = getAtributo({
      //   atributo: "permite_null",
      //   conf: filtro,
      // });

      //  if (permiteNull === "n") throw new Error(`El ${id_a} es obligatorio`);

      aplicaWhere(query, queryFiltros[id_a], filtro, ctx);
    });
  }
  return query;
};

export class ConfBuilder {
  public static armarListado = async (
    ctx: HttpContextContract,
    listado: SConf,
    conf: SConf,
    bouncer: any,
    queryFiltros: any,
    id: number,
    usuario?: Usuario,
    solo_conf?: string,
    excel?: boolean
  ) => {
    try {
      let opciones = this.setOpciones(ctx, listado, conf, id);
      let opcionesPantalla = {};
      let datos = [];
      let res = listadoVacio;

      if (!(await bouncer.allows("AccesoConf", listado))) return listadoVacio;

      if (opciones.display_container === "n")
        return {
          opciones,
          datos,
          cabeceras: [],
          filtros: [],
          listadoBotones: [],
        };

      let configuracionDeUsuario = [] as any;

      if (usuario && usuario.id) {
        configuracionDeUsuario = await M.SConfConfUsuario.query()
          .where("id_conf", listado.id)
          .andWhere("id_usuario", usuario.id)
          .preload("detalles", (query) =>
            query.preload("conf", (query) => query.preload("tipo"))
          );

        ctx.usuario.configuracionesDeUsuario[listado.id_a] =
          configuracionDeUsuario[0];
        opciones["configuracionDeUsuario"] = configuracionDeUsuario[0];
      }

      conf?.valores.forEach((val) => {
        if (val.evaluar === "s") {
          return (opcionesPantalla[val.atributo[0].nombre] = eval(val.valor));
        }
        opcionesPantalla[val.atributo[0].nombre] = val.valor;
      });

      if (
        opciones.configuracion_usuario_activo === "s" &&
        configuracionDeUsuario[0]
      ) {
        listado?.valores.forEach((val) => {
          if (configuracionDeUsuario[0][val.atributo[0].nombre])
            opciones[val.atributo[0].nombre] =
              configuracionDeUsuario[0][val.atributo[0].nombre];
        });
      }

      let columnas = await verificarPermisos({
        ctx,
        conf: listado,
        bouncer,
        tipoId: 4,
      });
      let filtros_aplicables = await verificarPermisos({
        ctx,
        conf: listado,
        bouncer,
        tipoId: 3,
      });
      let listado_boton_admitidos = await verificarPermisos({
        ctx,
        conf: listado,
        bouncer,
        tipoId: 8,
      });

      if (excel) {
        // si solo tiene que calcular excel busca unicamente la columna de configuracion de excel
        columnas = [
          columnas.find((c) =>
            c.valores.find((v) => v.atributo[0].nombre === "excel_export")
          ),
        ];
      }

      if (
        getAtributo({
          atributo: "configuracion_usuario_activo",
          conf: listado,
        })?.trim() === "s"
      ) {
        const MenuConfiguracionDeListado = await M.SConf.query()
          .where("id_a", "CONTENEDOR_SISTEMA_CONFIGURACION_LST")
          .preload("conf_permiso", (query) => query.preload("permiso"))
          .preload("tipo")
          .preload("orden")
          .preload("valores", (query) => query.preload("atributo"))
          .preload("sub_conf", (query) => this.preloadRecursivo(query))
          .firstOrFail();

        const MenuConfiguracionDeListadoArmado = await this.armarContenedor({
          ctx,
          contenedor: MenuConfiguracionDeListado,
          idListado: listado.id,
          idVista: listado.id,
        });

        opciones["configuracionesDeListado"] = [
          MenuConfiguracionDeListadoArmado,
        ];
      }

      //Chequear filtros obligatorios
      if (solo_conf === "n" /* iniciar_activo = "s" */) {
        const filtrosObligatorios = filtros_aplicables
          .filter(
            (f) => getAtributo({ atributo: "permite_null", conf: f }) === "n"
          )
          .map((f) => {
            return { id_a: f.id_a, id: f.id };
          });

        const filtrosOpcionalesNull = filtros_aplicables
          .filter(
            (f) => getAtributo({ atributo: "opcionales_null", conf: f }) === "s"
          )
          .map((f) => f.id_a);

        if (filtrosObligatorios.length > 0) {
          let filtros_obligatorios_insatisfechos = filtrosObligatorios.filter(
            (k) => {
              return !queryFiltros[k.id_a] || queryFiltros[k.id_a] === null;
            }
          );

          const found = Object.keys(queryFiltros).some(
            (r) => filtrosOpcionalesNull.indexOf(r) >= 0
          ); // si Algun filtro opcional esta satisfecho

          if (found) {
            filtros_obligatorios_insatisfechos =
              filtros_obligatorios_insatisfechos.filter((f) =>
                filtrosOpcionalesNull.includes(f)
              ); // filtra todos los insatisfechos opcionales
          }

          if (filtros_obligatorios_insatisfechos.length > 0) {
            const error = `Los filtros ${filtros_obligatorios_insatisfechos
              .map((f) => f.id_a)
              .toString()} son obligatorios`;
            const cabeceras = await extraerElementos({
              ctx,
              sc_hijos: columnas,
              sc_padre: listado,
              bouncer,
              usuario,
              datos,
              id,
            });

            const filtros = await extraerElementos({
              ctx,
              sc_hijos: filtros_aplicables,
              sc_padre: listado,
              bouncer,
              usuario,
              datos,
              id,
            });

            const listadoBotones = await extraerElementos({
              ctx,
              sc_hijos: listado_boton_admitidos,
              sc_padre: listado,
              bouncer,
              usuario,
              datos,
              id,
            });

            res.cabeceras = cabeceras;
            res.filtros = filtros;
            res.opciones = opciones;
            res.listadoBotones = listadoBotones;
            res.error = { message: error };
            ctx.$_errores.push({
              error: { message: error, continuar: true },
              conf: listado.id_a,
            });
            res.sql = (await bouncer.allows("AccesoRuta", Permiso.GET_SQL))
              ? ctx.$_sql
              : undefined;
            ctx.response.status(410);
            return res;
          }
        }
        datos = (await this.getDatos(ctx, listado, id)) ?? [];
      }

      const cabeceras = await extraerElementos({
        ctx,
        sc_hijos: columnas,
        sc_padre: listado,
        bouncer,
        usuario,
        datos,
        id,
      });

      const filtros = await extraerElementos({
        ctx,
        sc_hijos: filtros_aplicables,
        sc_padre: listado,
        bouncer,
        usuario,
        datos,
        id,
      });

      const listadoBotones = await extraerElementos({
        ctx,
        sc_hijos: listado_boton_admitidos,
        sc_padre: listado,
        bouncer,
        usuario,
        datos,
        id,
      });

      return {
        cabeceras,
        filtros,
        listadoBotones,
        opciones,
        datos: this.datosConComponenteCalculado({ datos, cabeceras }),
        sql: (await bouncer.allows("AccesoRuta", Permiso.GET_SQL))
          ? ctx.$_sql
          : undefined,
        conf: (await bouncer.allows("AccesoRuta", Permiso.GET_CONF))
          ? conf
          : undefined,
      };
    } catch (err) {
      console.log("ArmarListado", err);
      throw await new ExceptionHandler().handle(err, ctx);
    }
  };

  public static armarVista = async (
    ctx: HttpContextContract,
    vista: SConf,
    id: number,
    conf: SConf,
    bouncer: any,
    usuario?: Usuario,
    excel?: boolean
  ): Promise<vista> => {
    if (!(await bouncer.allows("AccesoConf", vista))) return vistaVacia;

    let opciones = this.setOpciones(ctx, vista, conf, id);
    let datos = [{}];
    let sql = "";

    let vistaFinal: vista = {
      opciones,
      datos,
      sql,
      cabeceras: [],
      error: { message: "" },
    };

    if (opciones.display_container === "n") return vistaFinal;

    let columnas = await verificarPermisosHijos({ ctx, conf: vista, bouncer });
    if (excel) {
      // si solo tiene que calcular excel busca unicamente la columna de configuracion de excel
      columnas = [
        columnas.find((c) =>
          c.valores.find((v) => v.atributo[0].nombre === "excel_export")
        ) as SConf,
      ];
    }
    const campos = getSelect(ctx, [columnas], 7, usuario);

    try {
      if (campos.length !== 0) {
        vistaFinal.sql = (await bouncer.allows("AccesoRuta", Permiso.GET_SQL))
          ? ctx.$_sql
          : undefined;
        vistaFinal.conf = (await bouncer.allows("AccesoRuta", Permiso.GET_CONF))
          ? vista
          : undefined;
        // console.log("vista sql: ", vistaFinal.sql);
        // await query.paginate(1, 15);
        vistaFinal.datos = (await this.getDatos(ctx, vista, id)) ?? [];

        ctx.$_datos = ctx.$_datos.concat(vistaFinal.datos);
      }
      vistaFinal.cabeceras = (
        await extraerElementos({
          ctx,
          sc_hijos: columnas,
          sc_padre: vista,
          bouncer,
          usuario,
          datos: vistaFinal.datos,
          id,
        })
      ).filter((c) => c);

      const _datosConComponenteCalculado = this.datosConComponenteCalculado({
        datos: vistaFinal.datos,
        cabeceras: vistaFinal.cabeceras,
      });

      vistaFinal.datos = _datosConComponenteCalculado;

      return vistaFinal;
    } catch (err) {
      // console.log("ArmarVista", err);
      return new ExceptionHandler().handle(err, ctx);
    }
  };

  public static armarContenedor = async ({
    ctx,
    idListado,
    idVista,
    contenedor,
  }: {
    ctx: HttpContextContract;
    contenedor: SConf;
    idListado: number;
    idVista: number;
  }) => {
    const father = ctx.$_conf.buscarPadre(contenedor.id);

    const p: {
      sql: { sql: string; conf: string }[] | undefined;
      opciones: { display_container: string; id_a: string };
      configuraciones: any[];
    } = {
      opciones: this.setOpciones(ctx, contenedor, father, idVista),
      configuraciones: [],
      sql: [],
    };

    if (p.opciones.display_container === "n") return p;

    if (!(await ctx.bouncer.allows("AccesoConf", contenedor))) return p;

    const _listados = contenedor.sub_conf.filter(
      (sc) => sc.tipo.id === 2
    ) as SConf[];
    const _vistas = contenedor.sub_conf.filter(
      (sc) => sc.tipo.id === 6
    ) as SConf[];

    const _listadosArmados = await Promise.all(
      _listados.map(async (listado) => {
        let solo_conf = "s";
        if (listado.getAtributo({ atributo: "iniciar_activo" }) === "s") {
          solo_conf = "n";
        }
        return await this.armarListado(
          ctx,
          listado,
          contenedor,
          ctx.bouncer,
          ctx.$_filtros.solicitados,
          idListado,
          ctx.usuario,
          solo_conf
        );
      })
    );

    const _vistasArmadas = await Promise.all(
      _vistas.map(async (vista) => {
        return this.armarVista(
          ctx,
          vista,
          idVista,
          contenedor,
          ctx.bouncer,
          ctx.usuario
        );
      })
    );

    const sql = (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
      ? ctx.$_sql
      : undefined;
    p.sql = sql;
    p.configuraciones = [];
    p.configuraciones = p.configuraciones.concat(_listadosArmados);
    p.configuraciones = p.configuraciones.concat(_vistasArmadas);

    return p;
  };

  public static armarABM = async ({
    ctx,
    conf,
    abm,
    id,
  }: {
    ctx: HttpContextContract;
    abm: SConf;
    conf: SConf;
    id?: number;
  }) => {
    if (!(await ctx.bouncer.allows("AccesoConf", abm))) return vistaVacia;
    let datos: any[] | undefined = [];

    const opciones = this.setOpciones(ctx, abm, conf, id);
    // console.log("ABM", opciones.display_container, opciones.id_a);
    if (opciones.display_container === "n") return { opciones, datos };

    const cabeceras = await extraerElementos({
      ctx,
      sc_hijos: abm.sub_conf,
      sc_padre: abm,
      bouncer: ctx.bouncer,
      usuario: ctx.usuario,
      id: ctx.request.body().id,
    });

    if (ctx.request.body().id && abm.getAtributo({ atributo: "parametro" })) {
      datos = (await this.getDatos(ctx, abm, ctx.request.body().id)) ?? [];
    }

    const sql = (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
      ? ctx.$_sql
      : undefined;

    const arbolConf = (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_CONF))
      ? conf
      : undefined;

    return {
      opciones,
      cabeceras,
      datos: this.datosConComponenteCalculado({ datos, cabeceras }),
      sql,
      conf: arbolConf,
    };
  };

  public static armarArtesanal = async ({ ctx, conf, art, id }) => {
    if (!(await ctx.bouncer.allows("AccesoConf", art))) return vistaVacia;
    const opciones = this.setOpciones(ctx, art, conf, id);
    let datos: any[] | undefined = [];
    // console.log("art", opciones.display_container, opciones.id_a);
    if (opciones.display_container === "n") return { opciones, datos };

    datos = await this.getDatos(ctx, conf, id);

    return {
      opciones,
      datos,
    };
  };

  public static preloadRecursivo = (query) => {
    return query
      .preload("conf_permiso", (query) => query.preload("permiso"))
      .preload("tipo")
      .preload("componente", (query) => query.preload("atributos"))
      .preload("orden")
      .preload("valores", (query) => query.preload("atributo"))
      .preload("sub_conf", (query) => this.preloadRecursivo(query));
  };

  public static setOpciones = (
    ctx: HttpContextContract,
    conf_h: SConf,
    conf: SConf,
    id?: number
  ): any => {
    try {
      ctx;
      id;
      const opciones = {};

      if (conf_h.tipo.id === 2) {
        opciones["configuracion_usuario_activo"] = "n";
        opciones["display_container"] = "s";
      }
      if (
        conf_h.tipo.id === 1 ||
        conf_h.tipo.id === 6 ||
        conf_h.tipo.id === 7 ||
        conf_h.tipo.id === 11
      ) {
        opciones["display_container"] = "s";
      }

      opciones["tipo"] = conf_h.tipo;
      opciones["id_a"] = conf_h.id_a;
      opciones["id"] = conf_h.id;

      if (conf_h.valores) {
        conf_h?.valores.map(async (val) => {
          let copyVal = val.valor;
          if (val.evaluar === "s") {
            copyVal = eval(val.valor);
          }
          if (val.subquery === "s") {
            try {
              const subquery = (await Database.rawQuery(copyVal))[0];

              ctx.$_sql.push({
                sql: Database.rawQuery(copyVal).toQuery(),
                conf: conf_h.id_a,
                confId: conf_h.id,
              });

              copyVal = subquery[0];
            } catch (err) {
              ctx.$_sql.push({
                sql: Database.rawQuery(copyVal).toQuery(),
                conf: conf_h.id_a,
                confId: conf_h.id,
                error: true,
              });
              return new ExceptionHandler().handle(err, ctx);
            }
          }
          if (val.atributo[0].nombre === "display_container") {
            copyVal = Object.values(copyVal)[0];
          }
          opciones[val.atributo[0].nombre] = copyVal;
        });
      } else {
        // console.log("conf_h sin valores", conf.id_a, conf.valores);
      }

      if (!conf) return opciones;

      opciones["orden"] = conf?.orden.find(
        (o) => o.id_conf_h === conf_h?.id
      )?.orden;

      return opciones;
    } catch (err) {
      //  console.log(Date.now(), err, ctx.auth.user?.id);
      throw new ExceptionHandler().handle(err, ctx);
    }
  };

  private static datosConComponenteCalculado = ({ datos, cabeceras }) => {
    const colocarComponente = (d, cab) => {
      cab.forEach((cab) => {
        if (d[`${cab.id_a}_CONDICION_ACCESO`] === 0) {
          d[`${cab.id_a}_COMPONENTE`] = "null";
        }
        if (d[`${cab.id_a}_CONDICION_ACCESO`] !== 0) {
          d[`${cab.id_a}_COMPONENTE`] = cab.componente ?? "columna_simple";
        }
        colocarComponente(d, cab.sc_hijos);
      });
    };
    const datosCalculados = datos.map((d) => {
      d = d.toJSON();
      colocarComponente(d, cabeceras);
      return d;
    });
    return datosCalculados;
  };

  private static getDatos = async (
    ctx: HttpContextContract,
    conf: SConf,
    id?: number
  ): Promise<any> => {
    const modelo = conf.getAtributo({
      atributo: "modelo",
    }) as unknown as string;
    const parametro = conf.getAtributo({ atributo: "parametro" });

    const tabla = conf.getAtributo({ atributo: "tabla" });
    tabla;

    const campos = getSelect(ctx, [conf], 7);
    const leftJoins = getLeftJoins({
      columnas: conf.sub_conf,
      conf: conf,
      ctx,
    });

    const groupsBy: gp[] = getGroupBy({ columnas: conf.sub_conf, conf: conf });
    const order = getOrder({ ctx, conf: conf });

    let filtros_aplicables = await verificarPermisos({
      ctx,
      conf,
      bouncer: ctx.bouncer,
      tipoId: 3,
    });

    if (modelo) {
      const Modelo = M[modelo];

      let query = Modelo.query() as DatabaseQueryBuilderContract;

      campos.forEach(async (campo) => {
        if (campo.evaluar === "s") {
          campo.campo = eval(campo.campo);
        }

        if (campo.subquery === "s") {
          try {
            ctx.$_sql.push({
              sql: Database.rawQuery(campo.campo).toQuery(),
              conf: campo.id_a,
              confId: campo.confId,
            });
            const subquery = await Database.rawQuery(campo.campo);
            return query.select(`"${subquery[0]}"`);
          } catch (err) {
            err.id = campo.id_a;
            ctx.$_sql.push({
              sql: Database.rawQuery(campo.campo).toQuery(),
              conf: campo.id_a,
              confId: campo.confId,
              error: true,
            });
            return await new ExceptionHandler().handle(err, ctx);
          }
        }
        query.select(
          Database.raw(
            `${campo.campo} ${campo.alias ? "as " + campo.alias : ""}`
          )
        );
      });

      // aplicarPreloads - left join
      if (leftJoins.length > 0) {
        leftJoins.forEach((leftJoin) => {
          if (leftJoin.evaluar === "s") {
            return query.joinRaw(eval(leftJoin.valor));
          }
          query.joinRaw(leftJoin.valor);
        });
      }
      // aplicar groupsBy
      if (groupsBy.length > 0) {
        groupsBy.forEach(({ groupBy, having }) => {
          query.groupBy(groupBy);
          if (having) query.having(having as unknown as RawQuery); // ??
        });
      }
      // aplicar order del listado
      if (order.length > 0) {
        order.forEach((order) => {
          const orderValores = order.split(",");

          query.orderBy(
            orderValores[0],
            orderValores[1] ? orderValores[1].trim() : "desc"
          );
        });
      }

      query = aplicarFiltros(
        ctx,
        query,
        conf,
        id,
        ctx.request.qs(), // queryFiltros
        filtros_aplicables
      );

      if (id && parametro) {
        query.where(`${parametro}`, id);
      }

      try {
        ctx.$_sql.push({
          sql: query.toQuery(),
          conf: conf.id_a,
          confId: conf.id,
        });
        const datos = await query;
        ctx.$_datos = ctx.$_datos.concat(datos);

        return datos;
      } catch (err) {
        ctx.$_sql.push({
          sql: query.toQuery(),
          conf: conf.id_a,
          confId: conf.id,
          error: true,
        });
        ctx.$_errores.push({
          error: { message: err.sqlMessage, continuar: false },
          conf: conf.id_a,
        });

        return new ExceptionHandler().handle(err, ctx);
      }
    }

    return [];
  };
}

export const modificar = async (
  ctx: HttpContextContract,
  id: number,
  valor: any,
  conf: SConf,
  usuario: Usuario
) => {
  const funcion = getAtributo({ atributo: "update_funcion", conf });

  if (!funcion) return Update.update({ ctx, usuario, id, valor, conf });

  return eval(funcion)({ ctx, usuario, id, valor, conf });
};

export const insertar = (
  ctx: HttpContextContract,
  valor: any,
  insert_ids: any,
  conf: SConf,
  usuario: Usuario
) => {
  try {
    const funcion = getAtributo({ atributo: "insert_funcion", conf });

    if (!funcion)
      return Insertar.insertar({ ctx, valor, insert_ids, conf, usuario });

    return eval(funcion)({ ctx, valor, insert_ids, conf, usuario });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const eliminar = (
  ctx: HttpContextContract,
  delete_id: number,
  conf: SConf,
  usuario: Usuario
) => {
  const funcion = getAtributo({ atributo: "delete_funcion", conf });

  if (!funcion) return Eliminar.eliminar({ ctx, delete_id, conf, usuario });

  return eval(funcion)({ ctx, delete_id, conf, usuario });
};

export const insertarABM = (ctx: HttpContextContract, formData: {}, conf) => {
  try {
    const funcion = getAtributo({ atributo: "insert_funcion", conf });
    if (!funcion) return Insertar.insertarABM({ ctx, formData, conf });

    return eval(funcion)({ ctx, formData, conf });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const listadoVacio: listado = {
  datos: [],
  cabeceras: [],
  filtros: [],
  listadoBotones: [],
  opciones: {},
  sql: undefined,
  error: { message: "" },
};

const vistaVacia = {
  datos: [],
  cabeceras: [],
  opciones: {},
  sql: "",
  error: { message: "" },
};

export interface listado {
  listadoBotones: ({} | undefined)[];
  datos: any[];
  cabeceras: any[];
  filtros: any[];
  opciones: {};
  sql?: any;
  conf?: SConf;
  error?: { message: string };
}

export interface vista {
  datos: any[];
  cabeceras: any[];
  opciones: {};
  sql?: any;
  conf?: SConf;
  error?: { message: string };
}
