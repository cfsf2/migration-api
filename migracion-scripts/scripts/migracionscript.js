const Permiso = require("../models/permisos");
const Perfil = require("../models/perfiles");
const Farmacia = require("../models/farmacia");
const Usuario = require("../models/user");
const Institucion = require("../models/instituciones");
const ProductoTransfer = require("../models/transfers/productoTransfer");
const ProductoPack = require("../models/packsproductos/productopack");
const Pedido = require("../models/pedidos");
const Entidad = require("../models/packsproductos/entidad");
const Laboratorio = require("../models/transfers/laboratorio");
const Drogueria = require("../models/transfers/drogueria");
const Publicidad = require("../models/publicidad");
const Categoria = require("../models/packsproductos/categoria");
const Transfer = require("../models/transfers/transfer");
const Solicitud = require("../models/packsproductos/solicitudproveeduria");
const DebitoFarmacia = require("../models/debitoFarmacia");
const Farmaciaux = require("../models/farmaciaux");
const ProductoCustom = require("../models/packsproductos/tbl_producto_customs");
const Localidad = require("../models/localidad");
const Provincia = require("../models/provincia");
const Farmacia_Institucion = require("../models/farmacia_institucion");
const Publicidad_Institucion = require("../models/publicidad_institucion");

const con = require("./mysqlCon");

const farmacia_asignar_usuario_idsql = async () => {
  const farmacias = await Farmacia.find({ idsql_usuario: null });
  const total = farmacias.length;
  let i = 1;
  let counter = 1;

  farmacias.forEach(async (farmacia) => {
    i = i + 1;
    const usuario = await Usuario.findOne({ usuario: farmacia.usuario });

    if (!usuario) {
      console.log("//---Farmacia---//");
      console.log(farmacia.nombre);
      console.log("//--- Usuario---//");
      console.log(farmacia.usuario);
      return;
    }

    farmacia.idsql_usuario = usuario.idsql;
    await farmacia.save();

    console.log(
      (counter / total) * 100 + "% completado farmacia_asignar_usuario_idsql"
    );
    counter = counter + 1;
  });
};

const instituciones_asignar_idsql_institucion_madre = async () => {
  const instituciones = await Institucion.find({});
  let counter = 1;
  const total = instituciones.length;

  instituciones.forEach(async (institucion) => {
    if (institucion.id_institucion_madre) {
      const madre = await Institucion.findOne({
        _id: institucion.id_institucion_madre,
      });

      await institucion.set({ idsql_institucion_madre: madre.idsql });
      await institucion.save();
    }
    console.log(
      (counter / total) * 100 +
        "% completado instituciones_asignar_idsql_institucion_madre"
    );
    counter = counter + 1;
  });
};

const usuario_asignar_id_localidad = async () => {
  try {
    const usuarios = await Usuario.find({
      localidad: { $ne: null },
      //id_localidad: null,
    });
    const total = usuarios.length;
    let count = 0;

    usuarios.forEach(async (usuario) => {
      const localidad = await Localidad.findOne({
        nombre: {
          $regex: ".*" + usuario.localidad + ".*",
          $options: "i",
        },
      });
      if (!localidad) {
        console.log("--------------------------");
        console.log("usuario: " + usuario.usuario);
        console.log("localidad usuario: " + usuario.localidad);
        return;
      }
      usuario.set({ id_localidad: localidad.id });
      usuario.save();
    });
  } catch (er) {
    console.log(er);
  }
};

const farmacia_asignar_id_localidad = async () => {
  try {
    const farmacias = await Farmacia.find({
      localidad: { $ne: null },
      id_localidad: null,
    });
    const total = farmacias.length;
    let count = 0;

    farmacias.forEach(async (farmacia) => {
      const localidad = await Localidad.findOne({
        nombre: {
          $regex: ".*" + farmacia.localidad + ".*",
          $options: "i",
        },
      });
      if (!localidad) {
        console.log("--------------------------");
        console.log("usuario: " + farmacia.usuario);
        console.log("localidad farmacia: " + farmacia.localidad);
        return;
      }
      farmacia.set({ id_localidad: localidad.id });
      farmacia.save();
    });
  } catch (er) {
    console.log(er);
  }
};

const farmaciaux_asignar_id_localidad = async () => {
  try {
    const farmacias = await Farmaciaux.find({
      localidad: { $ne: null },
      id_localidad: null,
    });
    const total = farmacias.length;
    let count = 0;

    farmacias.forEach(async (farmacia) => {
      const localidad = await Localidad.findOne({
        nombre: {
          $regex: ".*" + farmacia.localidad + ".*",
          $options: "i",
        },
      });
      const provincia = await Provincia.findOne({
        nombre: {
          $regex: ".*" + farmacia.provincia + ".*",
          $options: "i",
        },
      });
      if (!localidad) {
        console.log("--------------------------");
        console.log("usuario: " + farmacia.usuario);
        console.log("localidad farmacia: " + farmacia.localidad);
        console.log("provincia: " + farmacia.provincia);
        return;
      }
      farmacia.set({ id_localidad: localidad.id, id_provincia: provincia.id });
      farmacia.save();
    });
  } catch (er) {
    console.log(er);
  }
};

const usuario_formatearFecha = async () => {
  const acomodarFecha = (fecha) => {
    let fecha_a = fecha.split("-");

    let [dia, mes, anio] = fecha_a;

    let _dia;
    let _mes;
    let _anio;

    if (parseInt(mes) < 13) {
      _mes = mes;
    }

    if (parseInt(dia) > 31 && dia.length !== 4) null;

    if (dia && dia.length === 4) {
      _anio = dia;
      _dia = anio;
    }

    if (dia && dia.length === 2 && dia < 32) {
      _dia = dia;
    }

    if (!_anio && anio && anio.length === 2) {
      if (parseInt(anio) < 6) {
        _anio = "20" + anio;
      }
      if (parseInt(anio) > 30) {
        _anio = "19" + anio;
      }
    }

    if (anio && anio.length === 4) {
      _anio = anio;
      _dia = dia;
    }

    if (_anio && _mes && _dia) {
      let res = `${_anio}-${_mes}-${_dia}`;
      return res;
    }
    return null;
  };
  const usuarios = await Usuario.find({ fechaNac: { $ne: null } });

  usuarios.forEach((usuario) => {
    if (usuario.fechaNac) {
      const f = acomodarFecha(usuario.fechaNac);

      usuario.fechaNac_f = f;
      usuario.save();

      console.log(f);
    }
  });
};

const usuario_dni = async () => {
  const usuarios = await Usuario.find({ dni: { $ne: null } });

  usuarios.forEach((u) => {
    let dni = u.dni.split(".").join("");

    const isNan = !isNaN(dni);

    if (!isNan) {
      dni = null;
    }
    u.dni = dni;
    u.save();
  });
};

const asignar_idsql = async (Modelo) => {
  const objetos = await Modelo.find({ idsql: null });
  const total = objetos.length;
  if (objetos.length === 0) return;
  console.log(objetos.length);
  let conidsql = await Modelo.where({ idsql: { $ne: null } }).sort({
    idsql: -1,
  });
  let i = conidsql[0].idsql + 2;
  let counter = 1;

  console.log("Objectos sin idsql: " + objetos.length);
  console.log("idsql a partir de: " + i);

  await objetos.forEach(async (objeto) => {
    objeto.idsql = i;
    i = i + 1;
    await objeto.save();
    console.log((counter / total) * 100 + "% completado asignar_idsql ");
    counter = counter + 1;
  });
};

const productoPack_categoria_entidad_idsql = async () => {
  const productos = await ProductoPack.find({
    $or: [{ idsql_entidad: null }, { idsql_categoria: null }],
  });
  const total = productos.length;
  let counter = 0;

  productos.forEach(async (producto) => {
    const entidad = await Entidad.findOne({
      _id: producto.entidad_id,
    });

    if (entidad) {
      producto.idsql_entidad = entidad.idsql;
    } else {
      producto.idsql_entidad = null;
    }

    if (producto.categoria_id !== "sin_categoria") {
      const categoria = await Categoria.findOne({
        _id: producto.categoria_id,
      }).select({ idsql: 1 });
      if (categoria) {
        producto.idsql_categoria = categoria.idsql;
      }
    } else {
      producto.idsql_categoria = null;
    }
    await producto.save();

    counter = counter + 1;
    console.log(
      (counter / total) * 100 +
        "% completado productoPack_categoria_entidad_idsql "
    );
  });
};

const laboratorio_asign_transferFarmageo = async () => {
  const laboratorios = await Laboratorio.find({
    transfer_farmageo: { $ne: false },
  });

  laboratorios.forEach((lab) => {
    lab.transfer_farmageo = true;
    lab.save();
  });
};

const tbl_farmacia_productopack = async () => {
  console.log("--------------------");
  const productosPack = await ProductoPack.find({});

  console.log("Total Productos Pack: " + productosPack.length);

  const farmaciasConEcommerce = await Farmacia.find({
    // $or: [
    //   { excepcionesProdFarmageo: { $exists: true, $not: { $size: 0 } } },
    //   { excepcionesEntidadesFarmageo: { $exists: true, $not: { $size: 0 } } },
    // ],
    perfil_farmageo: "vender_online",
  });
  const entidades = await Entidad.find({});

  let cantRel = 0;

  farmaciasConEcommerce.forEach((farmacia) => {
    let productos = [...productosPack];

    console.log("----------------");
    console.log("Farmacia " + farmacia.idsql + " no asocia:");

    farmacia.excepcionesEntidadesFarmageo.forEach((entidad_id) => {
      const ent = entidades.filter((en) => {
        return en._id.toString() === entidad_id.toString();
      });
      console.log(ent[0] ? "entidad: " + ent[0].entidadnombre : null);

      const productosExcepcionados = productosPack.filter((prod) => {
        if (ent[0]) {
          return prod.idsql_entidad === ent[0].idsql;
        }
      });
      console.log("cantidad de prods: " + productosExcepcionados.length);

      productos = productos.filter((p) => {
        const peidsql = productosExcepcionados.map((pe) => pe.idsql);

        return !peidsql.includes(p.idsql);
      });
    });

    farmacia.excepcionesProdFarmageo.forEach((prodExc_id) => {
      productos = productos.filter(
        (p) => p._id.toString() !== prodExc_id.toString()
      );
    });
    console.log(
      "otros productos exceptuados: " + farmacia.excepcionesProdFarmageo.length
    );
    console.log("productos asociados: " + productos.length);

    cantRel = cantRel + productos.length;

    const queries = productos.map((p) => {
      const sql = `INSERT INTO tbl_farmacia_producto_pack
          (id_farmacia, id_producto_pack, habilitado, id_usuario_creacion, id_usuario_modificacion)
          VALUES (${farmacia.idsql}, ${p.idsql}, "s", 1, 1) `;

      const values = [farmacia.idsql, p.idsql, "s", 1, 1];

      return queryPromise(con, sql);
    });
    Promise.all(queries)
      .then(() => {
        return console.log("tbl_farmacia_productopack Terminado");
      })
      .catch((err) => console.log(err));
  });

  console.log("================================");
  console.log(
    "Cantidad de Farmacias con Ecommerce: " + farmaciasConEcommerce.length
  );
  console.log(
    "Cantidad de entradas en la tabla tbl_farmacia_productoPack: " + cantRel
  );
  console.log("FIN");
};

const ProductosCustom = async () => {
  const farmaciasConProductosCustom = await Farmacia.find({
    productos: { $ne: null },
  });

  let productos = [];
  let countProd = 0;

  farmaciasConProductosCustom.forEach((farmacia) => {
    countProd = countProd + farmacia.productos.length;

    farmacia.productos.forEach((producto) => {
      productos.push(producto);
    });
  });

  console.log("cantidad de productos Custom : " + countProd);
  console.log("Array de productos: " + productos.length);

  let count = 0;
  let i = 1;
  productos.forEach(async (producto) => {
    let exists = await ProductoCustom.countDocuments({ _id: producto._id });

    if (exists > 0) {
      ProductoCustom.findOneAndUpdate(
        { _id: producto._id },
        {
          descripcion: producto.descripcion,
          nombre: producto.nombre,
          imagen: producto.imagen,
          habilitado: producto.habilitado,
          favorito: producto.favorito,
          precio: producto.precio,
          sku: producto.sku,
          en_papelera: producto.en_papelera,
          inventario: producto.inventario,
          esPromocion: producto.esPromocion ? producto.esPromocion : false,
        }
      ).then((r) => {
        if (producto.esPromocion) console.log(r);
      });
      return;
    } else {
      p = new ProductoCustom({
        _id: producto._id,
        descripcion: producto.descripcion,
        nombre: producto.nombre,
        imagen: producto.imagen,
        habilitado: producto.habilitado,
        favorito: producto.favorito,
        precio: producto.precio,
        sku: producto.sku,
        en_papelera: producto.en_papelera,
        inventario: producto.inventario,
        esPromocion: producto.esPromocion,
        idsql: i,
      });
    }
    i = i + 1;

    try {
      await p.save();
      count = count + 1;
      console.log(
        ((count / countProd) * 100).toFixed(2) + "% completado ProductosCustom"
      );
    } catch (err) {
      if (err.code === 11000) {
        count = count + 1;
        console.log(
          ((count / countProd) * 100).toFixed(2) +
            "% completado ProductosCustom"
        );
        return;
      }

      console.log(err);
      return;
    }
  });
};

const tbl_farmacia_producto_custom = async () => {
  const farmaciasConProductosCustom = await Farmacia.find({
    productos: { $ne: [] },
  });

  const productosCustom = await ProductoCustom.find({});

  let count = 0;

  farmaciasConProductosCustom.forEach(async (farmacia) => {
    const productos_id = farmacia.productos.map((prod) => prod._id.toString());
    const productos = productosCustom.filter((prod) =>
      productos_id.includes(prod._id)
    );

    console.log(
      "Farmacia: " +
        farmacia.nombre +
        " tiene " +
        productos.length +
        " productos!"
    );
    count = count + productos.length;

    await con.query(
      `SELECT * FROM tbl_farmacia WHERE id=${farmacia.idsql}`,
      function (err, result) {
        if (err) {
          console.log(err);
        }
        if (result[0]) {
          productos.forEach((prod) => {
            const sql = `INSERT INTO tbl_farmacia_producto_custom
          (id_farmacia, id_producto_custom, habilitado, id_usuario_creacion, id_usuario_modificacion)
          VALUES (${farmacia.idsql}, ${prod.idsql}, "s", 1, 1)
          `;
            con.query(sql, function (err, result) {
              if (err) {
                console.log("Farmacia: " + farmacia.idsql);
                console.log("Producto: " + prod.idsql);
                console.log(err);
              }
              console.log(
                "Farmacia " +
                  farmacia.nombre +
                  " conectado con producto " +
                  prod.idsql
              );
            });
          });
        }
        return;
      }
    );
  });
  console.log("TOTAL: " + count);
};

const asignar_idsql_externo = async (
  ModelPrimario,
  ModelSecundario,
  keyPrimario,
  keySecundario
) => {
  console.log("Cargando datos...");

  const objPrimario = await ModelPrimario.find({ [keyPrimario]: null });
  const objSecundario = await ModelSecundario.find({});

  console.log("Inicio de escritura");
  console.log("Objetos Primarios encontrados: " + objPrimario.length);
  console.log("Objetos Secundarios encontrados: " + objSecundario.length);

  let count = 0;
  const total = objPrimario.length;

  objPrimario.forEach(async (objP) => {
    if (objP[keySecundario]) {
      const objS = objSecundario.filter(
        (objS) => objS._id.toString() === objP[keySecundario].toString()
      );

      objP[keyPrimario] = objS[0].idsql;

      try {
        await objP.save();
      } catch (err) {
        console.log(err);
        return;
      }
    }

    count = count + 1;
    console.log(
      ((count * 100) / total).toFixed(3) + "% completado asignar_idsql_externo"
    );
  });
};

const tbl_transfer_productos = async () => {
  return new Promise(async (resolve, reject) => {
    console.log("Recuperando productos transfer de mongodb...");

    const productos = await ProductoTransfer.find({});

    const total = productos.length;
    let count = 0;

    const queries = productos.map(async (prod) => {
      const sql = `INSERT IGNORE INTO tbl_transfer_producto 
    (id, id_laboratorio, nombre, habilitado, presentacion, cantidad_minima, descuento_porcentaje, precio, codigo, en_papelera, id_usuario_creacion, id_usuario_modificacion)
    VALUES (
    ${prod.idsql},
    ${prod.idsql_laboratorio ? prod.idsql_laboratorio : null}, 
    "${prod.nombre ? prod.nombre : null}", 
    "${prod.habilitado ? "s" : "n"}",
    "${prod.presentacion ? prod.presentacion : null}", 
    ${prod.cantidad_minima ? prod.cantidad_minima : null}, 
    ${prod.descuento_porcentaje ? prod.descuento_porcentaje : null}, 
    ${prod.precio ? prod.precio : null}, 
    "${prod.codigo ? prod.codigo : null}", 
    "${(prod.en_papelera = null || !prod.en_papelera ? "n" : "s")}", 1, 1)
    `;

      return queryPromise(con, sql);
    });
    Promise.all(queries)
      .then(() => {
        console.log("Productos Transfer migrados");
        resolve();
      })
      .catch((err) => console.log(err));
  });
};

const transfer_asignar_idsql_codigotransfer = async () => {
  const objetos = await Transfer.find({ idsql: null });
  const total = objetos.length;

  let counter = 1;

  objetos.forEach(async (objeto) => {
    objeto.idsql = objeto.codigo_transfer;
    await objeto.save();
    console.log(
      (counter / total) * 100 +
        "% completado transfer_asignar_idsql_codigotransfer"
    );
    counter = counter + 1;
  });
};

const tbl_transfers = async () => {
  // console.time("Recuperacion de datos de mongoDb");
  // console.log("Recuperacion de datos de mongoDb");
  const transfers = await Transfer.find({});
  const farmacias = await Farmacia.find({});
  const droguerias = await Drogueria.find({});
  const laboratorios = await Laboratorio.find({});
  const productosTransfer = await ProductoTransfer.find({});
  // console.timeEnd("Recuperacion de datos de mongoDb");

  transfers.forEach((transfer, transfer_index) => {
    // console.time("Filtrando labs, drogs y farms...");
    // console.log("Filtrando labs, drogs y farms... para " + transfer_index);
    const laboratorio = laboratorios.filter(
      (lab) => lab.nombre === transfer.laboratorio_id
    )[0];
    const drogueria = droguerias.filter(
      (drog) => drog.nombre === transfer.drogueria_id
    )[0];
    let farmacia = farmacias.filter(
      (farm) => farm.farmaciaid === transfer.farmacia_id
    )[0];
    if (!farmacia) {
      farmacia = farmacias.filter(
        (farm) => farm.id === transfer.farmacia_id
      )[0];
    }

    // console.timeEnd("Filtrando labs, drogs y farms...");

    // if (!farmacia)
    //   return console.log("Farmacia eliminada " + transfer.farmacia_id);

    //console.time("Mapeando productos solicitados...");

    const productos = transfer.productos_solicitados
      .map((prod) => {
        const idsql_prod = productosTransfer.filter(
          (pT) => pT._id.toString() === prod._id.toString()
        )[0];
        try {
          if (idsql_prod) {
            let new_prod = prod;
            new_prod.idsql = idsql_prod.idsql;
            return new_prod;
          }
        } catch (err) {
          console.log(err);
          console.log(idsql_prod);
          console.log(prod);
          throw err;
        }
      })
      .filter((el) => !!el);
    //console.log("Tiene elementos vacios: " + productos.includes(undefined));
    // console.log("Mapeando productos solicitados... " + productos.length);
    // console.timeEnd("Mapeando productos solicitados...");

    if (
      farmacia &&
      farmacia.idsql &&
      laboratorio &&
      laboratorio.idsql &&
      drogueria &&
      drogueria.idsql
    ) {
      const sql_transfer = `INSERT INTO tbl_transfer
     (id, id_drogueria, id_farmacia, id_laboratorio, fecha, id_transfer_estado, nro_cuenta_drogueria, email_destinatario, productos_solicitados, id_usuario_creacion, id_usuario_modificacion)
     VALUES (${transfer.codigo_transfer}, ${drogueria.idsql}, ${
        farmacia.idsql
      }, ${laboratorio.idsql},"${
        transfer.fecha.toISOString().split("T")[0]
      }", 1, "${transfer.nro_cuenta_drogueria}", "${
        transfer.email_destinatario
      }", '${JSON.stringify(
        transfer.productos_solicitados
      )}', 1, 1) ON DUPLICATE KEY UPDATE productos_solicitados = '${JSON.stringify(
        transfer.productos_solicitados
      )}'
     `;

      con.query(sql_transfer, function (err, result) {
        if (err) {
          console.log(sql_transfer);
          throw err;
        }
        productos.forEach((prod, index) => {
          const sql_transfer_transfer_producto = `INSERT INTO tbl_transfer_transfer_producto 
        (id_transfer, id_transfer_producto, cantidad, id_usuario_creacion, id_usuario_modificacion)
         VALUES (${transfer.codigo_transfer}, ${prod.idsql}, ${prod.cantidad}, 1, 1)
       `;
          con.query(sql_transfer_transfer_producto, function (err, result) {
            if (err) {
              console.log(sql_transfer_transfer_producto);
              console.log("Farmacia: " + farmacia.idsql);
              console.log("laboratorio: " + laboratorio.idsql);
              console.log("drogueria: " + drogueria.idsql);
              throw err;
            }
            console.log(
              "transfer nro: " +
                (transfer_index + 1) +
                " de " +
                transfers.length
            );
            console.log(
              "producto escritos: " +
                ((index + 1) / productos.length) * 100 +
                "%"
            );
          });
        });
      });
    }
  });
};

const tbl_farmacia_mediosdepago = async () => {
  const farmacias = await Farmacia.find({
    mediospagos: { $not: { $size: 0 } },
  });

  console.log(farmacias.length);
  const mediospagos = [
    { n: "visa", i: 1 },
    { n: "mastercard", i: 2 },
    { n: "american", i: 3 },
    { n: "cabal", i: 4 },
    { n: "naranja", i: 5 },
    { n: "pluspagos", i: 6 },
    { n: "todopago", i: 7 },
    { n: "mercadopago", i: 8 },
  ];

  farmacias.forEach((farmacia, f_indx) => {
    farmacia.mediospagos.forEach((medio) => {
      const medio_id = mediospagos.find((med) => med.n === medio).i;
      console.log(medio_id);

      const sql = `INSERT INTO tbl_farmacia_mediodepago (id_farmacia, id_mediodepago, id_usuario_creacion, id_usuario_modificacion) VALUES (${farmacia.idsql}, ${medio_id}, 1, 1)`;
      con.query(sql, function (err, result) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log(result);
      });
    });
  });
};

const queryPromise = (con, sql) => {
  return new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) {
        console.log(sql);
        reject(err);
        throw err;
      }
      const res = JSON.parse(JSON.stringify(result));
      resolve(res);
    });
  });
};

const tbl_farmacia_servicios = async () => {
  const farmaciasConServicios = await Farmacia.find({
    servicios: { $not: { $size: 0 } },
  });

  const servicios = await queryPromise(con, `SELECT * FROM tbl_servicio`);

  farmaciasConServicios.forEach((farmacia) => {
    farmacia.servicios.forEach(async (servicio) => {
      const serv_id = servicios.find((s) => {
        return s.nombre === servicio.tipo;
      }).id;
      const sql = `INSERT INTO tbl_farmacia_servicio (id_farmacia, id_servicio, id_usuario_creacion, id_usuario_modificacion) VALUES (${farmacia.idsql}, ${serv_id}, 1, 1)`;

      const r = await queryPromise(con, sql);
    });
  });
};

const tbl_farmacia_dia = async () => {
  const farmaciasConHorarios = await Farmacia.find({
    horarios: { $not: { $size: 0 } },
  });

  const dias = await queryPromise(con, `SELECT * FROM tbl_dia`);

  const diatabla = [
    { id: 2, nombre: "lunes" },
    { id: 3, nombre: "martes" },
    { id: 4, nombre: "miercoles" },
    { id: 5, nombre: "jueves" },
    { id: 6, nombre: "viernes" },
    { id: 7, nombre: "sabado" },
    { id: 1, nombre: "domingo" },
  ];

  farmaciasConHorarios.forEach((farmacia) => {
    farmacia.horarios.forEach((dia) => {
      const dia_sql = dias.find((d) => {
        return (
          d.nombre.toLowerCase() ===
          dia.dia
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
        );
      });

      if (!dia.habilitado) {
        const sql = `INSERT INTO tbl_farmacia_dia (id_dia, id_farmacia, habilitado, id_usuario_creacion, id_usuario_modificacion) 
        VALUES (${dia_sql.id},${farmacia.idsql}, 'n', 1, 1)`;
        return con.query(sql, function (err, res) {
          if (err) throw err;
        });
      }
      dia.bloques.forEach((bloque) => {
        const sql = `INSERT INTO tbl_farmacia_dia (id_farmacia, id_dia, inicio, fin, habilitado, id_usuario_creacion, id_usuario_modificacion) 
        VALUES (${farmacia.idsql},${dia_sql.id}, "${bloque.desde}", "${bloque.hasta}", 's', 1, 1)`;
        return con.query(sql, function (err, res) {
          if (err) throw err;
        });
      });
    });
  });
};

const stringOnull = (dato) => {
  if (dato) {
    if (dato !== "") {
      return `"${dato}"`;
    }
    return null;
  }
  return null;
};

const tbl_pedidos_producto_pack = async () => {
  const pedidos = await Pedido.find({});
  const farmacias = await Farmacia.find({});
  const productospack = await ProductoPack.find({});
  console.log(pedidos.length);
  const total = pedidos.length;

  pedidos.forEach(async (pedido) => {
    const id_pedido = pedido._id;
    const descripcion = stringOnull(pedido.descripcion);
    const comentarios = stringOnull(pedido.comentarios);
    const estados = [
      { n: "nuevo", i: 1 },
      { n: "enproceso", i: 2 },
      { n: "entregado", i: 3 },
      { n: "anulado", i: 4 },
      { n: "resuelto", i: 5 },
    ];
    const id_estado = estados.find((e) => e.n === pedido.estado)
      ? estados.find((e) => e.n === pedido.estado).i
      : null;
    let id_farmacia = farmacias.find(
      (farm) => farm.farmaciaid === pedido.idfarmacia
    );
    if (!id_farmacia)
      return console.log("farmacia " + pedido.idfarmacia + " no existe");
    id_farmacia = id_farmacia.idsql;
    const costoenvio = pedido.costoenvio;
    const domicilioenvio = pedido.domicilioenvio;
    const pago_online = pedido.pago_online ? "s" : "n";
    const envio = pedido.envio ? "s" : "n";
    const habilitado = pedido.habilitado ? "s" : "n";
    const fecha_entrega = pedido.fechaentrega.toISOString().split("T")[0];
    const idsocio = stringOnull(pedido.idsocio);
    const username = stringOnull(pedido.username);
    const datos_cliente = pedido.datos_cliente
      ? `'${JSON.stringify(pedido.datos_cliente)}'`
      : null;
    const es_invitado = pedido.es_invitado ? "s" : "n";
    const origen = stringOnull(pedido.origen);
    const nombrefarmacia = stringOnull(pedido.nombrefarmacia);
    const whatsapp = stringOnull(pedido.whatsapp);

    const p = pedido.gruposproductos[0];

    const obra_social = stringOnull(p.obra_social);
    const obra_social_frente = stringOnull(p.obra_social_frente);
    const obra_social_dorso = stringOnull(p.obra_social_dorso);
    const receta = stringOnull(p.receta);
    const precio_total = p.precio ? p.precio : null;

    const sql_pedido = `INSERT INTO tbl_pedido (id, descripcion, comentarios, id_estado_pedido, id_farmacia, costoenvio, domicilioenvio, gruposproductos, 
      pago_online, envio, habilitado, fechaentrega, es_invitado, id_socio, datos_cliente, origen, username, nombrefarmacia, whatsapp, 
      obra_social, obra_social_frente, obra_social_dorso, receta, total, id_usuario_creacion, id_usuario_modificacion)
      VALUES (${id_pedido}, ${descripcion}, ${comentarios},${id_estado}, ${id_farmacia}, "${costoenvio}", "${domicilioenvio}", 
      '${JSON.stringify(pedido.gruposproductos)}', 
      "${pago_online}", "${envio}", "${habilitado}", "${fecha_entrega}","${es_invitado}", ${idsocio}, ${datos_cliente}, ${origen}, ${username}, ${nombrefarmacia}, ${whatsapp},
      ${obra_social}, ${obra_social_frente}, ${obra_social_dorso}, ${receta}, ${precio_total}, 1, 1
       ) ON DUPLICATE KEY UPDATE tbl_pedido.id = ${id_pedido}, tbl_pedido.descripcion = ${descripcion}, 
       tbl_pedido.comentarios =${comentarios} , 
       tbl_pedido.id_estado_pedido =${id_estado} , 
       tbl_pedido.id_farmacia =${id_farmacia} ,
        tbl_pedido.costoenvio ="${costoenvio}"
       , tbl_pedido.domicilioenvio = "${domicilioenvio}"
       , tbl_pedido.gruposproductos ='${JSON.stringify(
         pedido.gruposproductos
       )}' , 
       tbl_pedido.pago_online =  "${pago_online}", 
       tbl_pedido.envio = "${envio}", 
       tbl_pedido.habilitado ="${habilitado}" , 
       tbl_pedido.fechaentrega = "${fecha_entrega}",
       tbl_pedido.es_invitado = "${es_invitado}", 
       tbl_pedido.id_socio =  ${idsocio}, 
       tbl_pedido.datos_cliente = '${JSON.stringify(pedido.datos_cliente)}',
       tbl_pedido.origen = ${origen},
        tbl_pedido.username = ${username} , 
        tbl_pedido.nombrefarmacia =  ${nombrefarmacia}, 
        tbl_pedido.whatsapp =${whatsapp} ,
       tbl_pedido.obra_social =  ${obra_social},
        tbl_pedido.obra_social_frente =  ${obra_social_frente}
        ,tbl_pedido.obra_social_dorso = ${obra_social_dorso} , 
        tbl_pedido.receta =${receta} , 
        tbl_pedido.total = ${precio_total} , 
        tbl_pedido.id_usuario_creacion =1, 
        tbl_pedido.id_usuario_modificacion=1
      `;

    await queryPromise(con, sql_pedido);

    p.productos.forEach((producto, indx) => {
      const cantidad = producto.cantidad;
      const precio_producto = producto.precio;
      const subtotal = producto.subtotal;

      const id_producto_pack = productospack.find(
        (prod) => prod._id.toString() === producto.idProducto.toString()
      )?.idsql;

      if (id_producto_pack) {
        const sql_pedido_producto = `INSERT INTO tbl_pedido_producto_pack (id_pedido, id_productospack, cantidad, precio, subtotal, id_usuario_creacion, id_usuario_modificacion)
          VALUES (${id_pedido}, ${id_producto_pack}, ${cantidad}, ${precio_producto}, ${subtotal}, 1, 1)`;
        con.query(sql_pedido_producto, function (err, result) {
          if (err) {
            console.log(sql_pedido_producto);
            throw err;
          }
          console.log(
            "pedido " +
              pedido.id +
              " progreso " +
              (indx + 1) +
              " de " +
              pedidos.length
          );
        });
      }
    });
  });
};

const tbl_perfil_permiso = async () => {
  const permisos = await Permiso.find({});
  const perfiles = await Perfil.find({});

  perfiles.forEach((perfil) => {
    {
      perfil.permisos.forEach((permiso) => {
        const per = permisos.find(
          (p) => p._id.toString() === permiso._id.toString()
        );
        console.log(perfil);

        const sql = `INSERT INTO tbl_perfil_permiso (id_perfil, id_permiso, id_usuario_creacion, id_usuario_modificacion) VALUES (${perfil.idsql}, ${per.idsql}, 1, 1)`;
        con.query(sql, function (err, result) {
          if (err) {
            console.log(sql);
            throw err;
          }
          console.log(
            "conectando perfil " + perfil.nombre + " con permiso " + per.slug
          );
        });
      });
    }
  });
};

const tbl_usuario_perfil = async () => {
  const usuarios = await Usuario.find({ perfil: { $ne: null } })
    .populate("perfil")
    .select({ idsql: 1, usuario: 1, perfil: 1 });

  usuarios.forEach((usuario) => {
    const sql = `INSERT INTO tbl_usuario_perfil (id_usuario, id_perfil, id_usuario_creacion, id_usuario_modificacion) VALUES (${usuario.idsql}, ${usuario.perfil.idsql}, 1, 1)`;
    con.query(sql, function (err, result) {
      if (err) {
        console.log(sql);
        throw err;
      }
      console.log(
        "dando perfil " + usuario.perfil.nombre + " a " + usuario.usuario
      );
    });
  });
};

const tbl_farmacia_institucion = async () => {
  const relaciones = await Farmacia_Institucion.find({}).populate(
    "farmacia institucion"
  );

  relaciones.forEach((rel, idx) => {
    if (rel.farmacia) {
      const sql = `INSERT IGNORE INTO tbl_farmacia_institucion (id_farmacia, id_institucion, id_usuario_creacion, id_usuario_modificacion) VALUES (${rel.farmacia.idsql}, ${rel.institucion.idsql}, 1, 1)`;
      con.query(sql, function (err, result) {
        if (err) {
          console.log(sql);
          throw err;
        }
        console.log(
          "relacion farmacia " +
            rel.farmacia.nombre +
            " con institucion " +
            rel.institucion.nombre
        );
        console.log(idx + 1 + " de " + relaciones.length);
      });
    }
  });
};

const tbl_publicidades = async () => {
  return new Promise(async (resolve, reject) => {
    const tipos = [
      { n: "novedadesadmin", i: 1 },
      { n: "comunicadoTransfers", i: 2 },
      { n: "mutual", i: 3 },
      { n: "infointeres", i: 4 },
      { n: "banners_admin", i: 5 },
      { n: "banners_ecommerce_home_col", i: 6 },
      { n: "banners_ecommerce_home_mut", i: 7 },
      { n: "banners_ecommerce_slider", i: 8 },
    ];

    const colores = [
      { n: "verde", i: 1 },
      { n: "rojo", i: 2 },
      { n: "amarillo", i: 3 },
    ];

    const publicidades = await Publicidad.find({});

    const queries = publicidades.map(async (publicidad, indx) => {
      const id_tipo = tipos.find((t) => t.n === publicidad.tipo).i;

      const id_color = colores.find((t) => t.n === publicidad.color)
        ? colores.find((t) => t.n === publicidad.color).i
        : null;

      const fecha_inicio = publicidad.fechainicio
        ? `"${publicidad.fechainicio.toISOString().split("T")[0]}"`
        : null;
      const fecha_fin = publicidad.fechafin
        ? `"${publicidad.fechafin.toISOString().split("T")[0]}"`
        : null;
      const habilitado = publicidad.habilitado ? "s" : "n";

      const sql = `INSERT INTO tbl_publicidad 
   (id, titulo, descripcion, link, imagen, id_publicidad_tipo, id_color, fecha_inicio, fecha_fin, habilitado, id_usuario_creacion, id_usuario_modificacion)
    VALUES (${publicidad.idsql},${stringOnull(publicidad.titulo)},${stringOnull(
        mysql_real_escape_string(publicidad.descripcion)
      )},${stringOnull(publicidad.link)}, ${stringOnull(
        publicidad.imagen
      )}, ${id_tipo}, ${id_color}, ${fecha_inicio}, ${fecha_fin}, 
    "${habilitado}", 1, 1 )
    ON DUPLICATE KEY UPDATE
    id = ${publicidad.idsql + 1},
    titulo =${stringOnull(publicidad.titulo)},
    descripcion =${stringOnull(
      mysql_real_escape_string(publicidad.descripcion)
    )} ,
    link= ${stringOnull(publicidad.link)},
    imagen= ${stringOnull(publicidad.imagen)},
    id_publicidad_tipo =${id_tipo} ,
    id_color= ${id_color} ,
    fecha_inicio= ${fecha_inicio},
    fecha_fin= ${fecha_fin} ,
    habilitado="${habilitado}" ,
    id_usuario_creacion=1,
    id_usuario_modificacion=1
    `;

      return queryPromise(con, sql);
      //console.log((100 * ((indx + 1) / publicidades.length)).toFixed(2) + "%");
    });

    Promise.all(queries).then(() => {
      console.log("publicidades migradas " + publicidades.length);
      resolve();
    });
  });
};

const tbl_publicidad_institucion = async () => {
  const relaciones = await Publicidad_Institucion.find({}).populate(
    "publicidad institucion"
  );
  console.log(relaciones);

  relaciones.forEach((rel, idx) => {
    const sql = `INSERT INTO tbl_publicidad_institucion (id_publicidad, id_institucion, id_usuario_creacion, id_usuario_modificacion)
                VALUES (${rel.publicidad.idsql}, ${rel.institucion.idsql}, 1, 1)
    `;

    con.query(sql, function (err, result) {
      if (err) {
        console.log(sql);
        throw err;
      }
      console.log(
        ((100 * (idx + 1)) / relaciones.length).toFixed(2) +
          "% completado tbl_publicidad_institucion"
      );
    });
  });
};

const tbl_ptransfer_institucion = async () => {
  const ptransfer = await queryPromise(
    con,
    `SELECT id, nombre FROM tbl_transfer_producto`
  );
  const institucion = await queryPromise(
    con,
    `SELECT * from tbl_institucion WHERE nombre = "CFSF2"`
  );
  console.log(institucion[0].id);
  ptransfer.forEach((prod, idx) => {
    const sql = `INSERT INTO tbl_transfer_producto_institucion (id_transfer_producto, id_institucion, id_usuario_creacion, id_usuario_modificacion)
     VALUES (${prod.id}, ${institucion[0].id}, 1, 1)`;

    con.query(sql, function (err, result) {
      if (err) {
        console.log(sql);
        throw err;
      }
      console.log(
        (((idx + 1) * 100) / ptransfer.length).toFixed(3) + "% completed"
      );
    });
  });
};

const tbl_solicitud_proveeduria = async () => {
  const solicitudes = await Solicitud.find({});

  let farmaciasid = solicitudes.map((soli) => soli.farmacia_id);
  farmaciasid = Array.from(new Set(farmaciasid));

  //const farmacias = await Farmacia.find({ farmaciaid: { $in: farmaciasid } });
  solicitudes.forEach(async (soli) => {
    const farmacia = await Farmacia.findOne({ farmaciaid: soli.farmacia_id });
    const entidad = await Entidad.findOne({ entidadnombre: soli.entidad_id });
    const productosSolicitados = soli.productos_solicitados.map(
      (prod) => prod.nombre
    );

    if (!farmacia || !entidad) return;

    const sql_solicitud = `INSERT INTO tbl_solicitud_proveeduria (id, id_estado_pedido,
       id_farmacia, id_entidad, fecha, nro_cuenta_drogueria, 
       email_destinatario, productos_solicitados, 
       id_usuario_creacion, id_usuario_modificacion)
    VALUES (${soli.codigo_solicitud}, 1 ,${farmacia.idsql}, ${
      entidad.idsql
    }, "${soli.fecha.toISOString().split("T")[0]}", ${stringOnull(
      soli.nro_cuenta_drogueria
    )}, ${stringOnull(soli.email_destinatario)}, '${JSON.stringify(
      soli.productos_solicitados
    )}', 1, 1  )
    ON DUPLICATE KEY UPDATE productos_solicitados = '${JSON.stringify(
      soli.productos_solicitados
    )}'`;

    await queryPromise(con, sql_solicitud);

    const productos = await ProductoPack.find({
      nombre: { $in: productosSolicitados },
    });

    if (farmacia && entidad) {
      productos.forEach((prod, idx) => {
        if (prod.idsql) {
          const sql = `INSERT INTO tbl_solicitud_proveeduria_producto_pack (id_solicitud_proveeduria, id_producto_pack, cantidad, id_usuario_creacion, id_usuario_modificacion)
                    VALUES (${soli.codigo_solicitud}, ${prod.idsql}, ${
            soli.productos_solicitados.find(
              (Sprod) => Sprod.nombre === prod.nombre
            ).cantidad
          },1,1)
        `;
          con.query(sql, function (err, result) {
            if (err) {
              console.log(sql);
              throw err;
            }

            console.log(
              "solicitud " +
                soli.codigo_solicitud +
                " escrito con " +
                (((idx + 1) * 100) / productos.length).toFixed(2) +
                "% productos"
            );
          });
        }
      });
    }
  });
};

function mysql_real_escape_string(str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case '"':
      case "'":
      case "\\":
      case "%":
        return "\\" + char; // prepends a backslash to backslash, percent,
      // and double/single quotes
      default:
        return char;
    }
  });
}

const debitoFarmaciaAsignaridsql = async () => {
  const debitosFarmacia = await DebitoFarmacia.find({});
  let i = 1;

  debitosFarmacia.forEach((deb, idx) => {
    deb.set({ idsql: i, id_usuario_creacion: 1, id_usuario_modificacion: 1 });
    i = i + 1;
    deb.save();
    console.log(
      (((idx + 1) * 100) / debitosFarmacia.length).toFixed(3) +
        "% completado debitoFarmaciaAsignaridsql"
    );
  });
};

const tbl_debitofarmacia = async () => {
  const debitos = await DebitoFarmacia.find({});

  debitos.forEach((deb, idx) => {
    const sql = `INSERT INTO tbl_debitofarmacia (id, usuario, periodo, archivo, id_usuario_creacion, id_usuario_modificacion)
      VALUES (${deb.idsql}, ${stringOnull(deb.usuario)}, ${stringOnull(
      deb.periodo
    )}, ${stringOnull(deb.archivo)}, 1, 1) ON DUPLICATE KEY UPDATE id=${
      deb.idsql
    }`;

    con.query(sql, function (err, result) {
      if (err) {
        console.log(sql);
        throw err;
      }
      console.log(
        (((idx + 1) * 100) / debitos.length).toFixed(3) +
          "% completado tbl_debitofarmacia"
      );
    });
  });
};

const tbl_usuario = () => {
  return new Promise(async (resolve, reject) => {
    const usuarios = await Usuario.find({});

    const queries = usuarios.map((u) => {
      const sql = `INSERT INTO tbl_usuario (id, usuario, nombre, apellido, dni, 
        fecha_nac, id_localidad, email, password, newsletter, habilitado, esfarmacia, 
        admin, confirmado, telefono, f_ultimo_acceso, deleted, demolab, id_wp, celular) VALUES (${
          u.idsql
        }, "${u.usuario}", "${u.name}", ${stringOnull(u.apellido)}, ${
        u.dni ? Math.min(u.dni, 2147483646) : null
      }, ${stringOnull(u.fechaNac_f)}, ${stringOnull(
        u.id_localidad
      )}, ${stringOnull(u.email)}, "${u.password}", ${stringOnull(
        u.newsletter ? "s" : "n"
      )}, ${stringOnull(u.habilitado ? "s" : "n")}, ${stringOnull(
        u.esfarmacia ? "s" : "n"
      )}, ${stringOnull(u.admin ? "s" : "n")}, ${stringOnull(
        u.confirmado ? "s" : "n"
      )}, ${stringOnull(u.telefono)}, ${stringOnull(
        u.ultimoacceso?.toISOString().replace("T", " ").replace("Z", "")
      )}, ${stringOnull(u.deleted ? "s" : "n")}, ${stringOnull(
        u.demolab ? "s" : "n"
      )}, ${u.id_wp ? "'" + u.id_wp + "'" : null}, ${stringOnull(u.celular)})
      ON DUPLICATE KEY UPDATE id = ${u.idsql} `;

      return queryPromise(con, sql);
    });

    Promise.all(queries).then(() => {
      console.log("Usuarios migrados " + usuarios.length);
      resolve();
    });
  });
};

const tbl_farmacia = () => {
  return new Promise(async (resolve, reject) => {
    const farmacias = await Farmacia.find({});

    const perfilFarmageo = (perfil) => {
      switch (perfil) {
        case "vender_online":
          return 1;
        case "solo_visible":
          return 2;
        case "no_visible":
          return 3;
        case "demo":
          return 4;
      }
    };

    const queries = farmacias.map((f) => {
      const sql = `INSERT INTO tbl_farmacia (id, id_usuario, password, 
        nombre, nombrefarmaceutico, 
        matricula, cufe, cuit, 
        id_localidad, calle, numero, 
        direccioncompleta, longitud, latitud, habilitado,
        imagen, email, telefono, whatsapp, facebook, instagram,
         web, id_perfil_farmageo, descubrir, envios, costoenvio, 
         tiempotardanza, visita_comercial, telefonofijo, f_ultimo_acceso, cp)
      VALUES (${f.idsql}, ${f.idsql_usuario}, ${stringOnull(
        f.password
      )}, ${stringOnull(f.nombre.toString())},${stringOnull(
        f.nombrefarmaceutico
      )},${stringOnull(f.matricula.replace(/\D/g, ""))}, ${stringOnull(
        f.cufe?.replace(/\D/g, "")
      )},${stringOnull(f.cuit?.replace(/\D/g, ""))},${stringOnull(
        f.id_localidad
      )},${stringOnull(f.calle)},${stringOnull(f.numero)}, ${stringOnull(
        f.direccioncompleta
      )}, ${stringOnull(f.log)}, ${stringOnull(f.lat)},${stringOnull(
        f.habilitado ? "s" : "n"
      )},${stringOnull(f.imagen)}, ${stringOnull(f.email)}, ${stringOnull(
        f.telefono
      )}, ${stringOnull(f.whatsapp)}, ${stringOnull(
        f.facebook?.slice(0, 120)
      )}, ${stringOnull(f.instagram)}, ${stringOnull(f.web)}, ${stringOnull(
        perfilFarmageo(f.perfil_farmageo)
      )}, ${stringOnull(f.descubrir ? "s" : "n")}, ${stringOnull(
        f.envios ? "s" : "n"
      )}, ${stringOnull(f.costoenvio)}, ${stringOnull(
        f.tiempotardanza
      )}, ${stringOnull(f.visita_comercial ? "s" : "n")},${stringOnull(
        f.telefonofijo
      )}, ${stringOnull(
        f.ultimoacceso?.toISOString().replace("T", " ").replace("Z", "")
      )}, ${f.cp ? `"${f.cp}"` : null}) 
      ON DUPLICATE KEY UPDATE id = ${f.idsql}, longitud=${
        f.log ? f.log : null
      }, latitud=${f.lat ? f.lat : null}, id_perfil_farmageo=${perfilFarmageo(
        f.perfil_farmageo
      )}, f_ultimo_acceso=${
        f.ultimoacceso
          ? "'" +
            f.ultimoacceso.toISOString().replace("T", " ").replace("Z", "") +
            "'"
          : null
      }, cp=${f.cp ? `"${f.cp}"` : null}, farmaciaid=${
        f.farmaciaid ? `"${f.farmaciaid}"` : null
      }`;

      return queryPromise(con, sql);
    });

    Promise.all(queries).then(() => {
      console.log("Farmacias migradas " + farmacias.length);
      resolve();
    });
  });
};

const tbl_producto_pack = () => {
  return new Promise(async (resolve, reject) => {
    const productos = await ProductoPack.find({});

    const queries = productos.map((p) => {
      const sql = `INSERT INTO tbl_producto_pack (id, nombre, sku, descripcion, id_categoria, id_entidad, en_papelera, imagen, habilitado, precio, precio_con_iva, rentabilidad, id_usuario_creacion, id_usuario_modificacion) VALUES (${
        p.idsql
      }, ${stringOnull(p.nombre)}, ${stringOnull(p.sku)}, ${stringOnull(
        p.descripcion ? mysql_real_escape_string(p.descripcion) : null
      )}, ${stringOnull(p.idsql_categoria)}, ${stringOnull(
        p.idsql_entidad
      )},${stringOnull(p.en_papelera ? "s" : "n")}, ${stringOnull(
        p.imagen
      )}, ${stringOnull(p.habilitado ? "s" : "n")}, ${stringOnull(
        p.precio
      )}, ${stringOnull(p.precio_con_iva)}, ${stringOnull(
        p.rentabilidad
      )}, 1, 1) ON DUPLICATE KEY UPDATE tbl_producto_pack.id = ${
        p.idsql
      }, tbl_producto_pack.id_categoria = ${
        p.idsql_categoria ? `"${p.idsql_categoria}"` : null
      }, tbl_producto_pack.id_entidad = ${
        p.idsql_entidad ? `"${p.idsql_entidad}"` : null
      }`;

      return queryPromise(con, sql);
    });
    Promise.all(queries).then(() => {
      console.log("Productos PAck migradas " + productos.length);
      resolve();
    });
  });
};

const tbl_laboratorio = () => {
  return new Promise(async (resolve, reject) => {
    const laboratorios = await Laboratorio.find({});

    const queries = laboratorios.map((l) => {
      const sql = ` INSERT INTO tbl_laboratorio (id, nombre, 
        habilitado, imagen, novedades, condiciones_comerciales, transfer_farmageo, url, id_usuario_creacion, id_usuario_modificacion) VALUES (${
          l.idsql
        }, "${l.nombre}", ${stringOnull(
        l.habilitado ? "s" : "n"
      )}, ${stringOnull(l.imagen)}, ${stringOnull(
        mysql_real_escape_string(l.novedades)
      )}, ${stringOnull(
        mysql_real_escape_string(l.condiciones_comerciales)
      )}, ${stringOnull(l.transfer_farmageo ? "s" : "n")}, ${stringOnull(
        l.url ? mysql_real_escape_string(l.url) : null
      )}, 1, 1) ON DUPLICATE KEY UPDATE tbl_laboratorio.id = ${l.idsql}`;

      return queryPromise(con, sql);
    });
    Promise.all(queries).then(() => {
      console.log("Laboratorios migradas " + laboratorios.length);
      resolve();
    });
  });
};

const tbl_producto_custom = () => {
  return new Promise(async (resolve, reject) => {
    const farmaciasConProductosCustom = await Farmacia.find({
      productos: { $ne: null },
    });
    let id = 1;

    const inventario = (i) => {
      switch (i) {
        case "hayexistencias":
          return 1;
        case "pocasexistencias":
          return 2;
        case "sinexistencias":
          return 3;
      }
    };

    let queriesPC = [];
    let queriesFPC = [];
    let productosCustoms = [];
    const sql = (
      p
    ) => `INSERT INTO tbl_producto_custom (id, descripcion, nombre, 
        imagen, habilitado, favorito, precio, sku, inventario, esPromocion, en_papelera, id_categoria)
      VALUES (${p.idsql}, ${
      p.descripcion && p.descripcion !== ""
        ? stringOnull(mysql_real_escape_string(p.descripcion))
        : '""'
    }, ${stringOnull(mysql_real_escape_string(p.nombre))}, ${stringOnull(
      p.imagen
    )}, "s", ${stringOnull(p.favorito ? "s" : "n")}, ${p.precio}, ${
      p.sku ? stringOnull(p.sku.toString().slice(0, 45)) : null
    }, ${inventario(p.inventario)},${stringOnull(
      p.esPromocion ? "s" : "n"
    )}, ${stringOnull(p.en_papelera ? "s" : "n")}, ${
      p.idsql_categoria ? p.idsql_categoria : null
    }) ON DUPLICATE KEY UPDATE tbl_producto_custom.id = ${p.idsql}
       , tbl_producto_custom.descripcion =${
         p.descripcion && p.descripcion !== ""
           ? stringOnull(mysql_real_escape_string(p.descripcion))
           : '""'
       }, tbl_producto_custom.nombre = ${stringOnull(
      mysql_real_escape_string(p.nombre)
    )}, tbl_producto_custom.imagen =  ${stringOnull(
      p.imagen
    )}, habilitado = "s", tbl_producto_custom.favorito = ${stringOnull(
      p.favorito ? "s" : "n"
    )}, tbl_producto_custom.precio = ${p.precio}, tbl_producto_custom.sku =  ${
      p.sku ? stringOnull(p.sku.toString().slice(0, 45)) : null
    }, tbl_producto_custom.inventario = ${inventario(
      p.inventario
    )}, tbl_producto_custom.esPromocion = ${stringOnull(
      p.esPromocion ? "s" : "n"
    )}, tbl_producto_custom.en_papelera = ${stringOnull(
      p.en_papelera ? "s" : "n"
    )}, tbl_producto_custom.id_categoria = ${
      p.idsql_categoria ? p.idsql_categoria : null
    }
       `;
    const sql2 = (
      p
    ) => `INSERT INTO tbl_farmacia_producto_custom (id_farmacia, id_producto_custom, en_papelera)
        VALUES (${p.id_farmacia}, ${p.idsql},${stringOnull(
      p.en_papelera ? "s" : "n"
    )} )`;

    farmaciasConProductosCustom.map((farmacia) => {
      farmacia.productos.map((p) => {
        const prod = p;
        prod.idsql = id;
        prod.id_farmacia = farmacia.idsql;

        productosCustoms.push(prod);

        id = id + 1;
        return;
      });
    });

    await Promise.all(productosCustoms.map((p) => queryPromise(con, sql(p))));
    await Promise.all(productosCustoms.map((p) => queryPromise(con, sql2(p))));
    resolve();
  });
};

module.exports = {
  tbl_usuario,
  tbl_farmacia,
  tbl_producto_pack,
  tbl_laboratorio,
  tbl_producto_custom,
  farmacia_asignar_usuario_idsql,
  instituciones_asignar_idsql_institucion_madre,
  usuario_asignar_id_localidad,
  farmacia_asignar_id_localidad,
  usuario_formatearFecha,
  usuario_dni,
  asignar_idsql,
  productoPack_categoria_entidad_idsql,
  laboratorio_asign_transferFarmageo,
  tbl_farmacia_productopack,
  ProductosCustom,
  debitoFarmaciaAsignaridsql,
  tbl_farmacia_producto_custom,
  tbl_transfer_productos,
  asignar_idsql_externo,
  transfer_asignar_idsql_codigotransfer,
  tbl_transfers,
  tbl_farmacia_mediosdepago,
  tbl_farmacia_servicios,
  tbl_farmacia_dia,
  tbl_pedidos_producto_pack,
  tbl_perfil_permiso,
  tbl_usuario_perfil,
  tbl_farmacia_institucion,
  tbl_publicidades,
  tbl_publicidad_institucion,
  tbl_ptransfer_institucion,
  tbl_solicitud_proveeduria,
  tbl_debitofarmacia,
  farmaciaux_asignar_id_localidad,
  con,
};
