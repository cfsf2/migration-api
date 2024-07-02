import { DateTime } from "luxon";

import {
  BaseModel,
  column,
  HasMany,
  hasMany,
  HasManyThrough,
  hasManyThrough,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Localidad from "./Localidad";
import PerfilFarmageo from "./PerfilFarmageo";
import FarmaciaServicio from "./FarmaciaServicio";
import Servicio from "./Servicio";

import Database from "@ioc:Adonis/Lucid/Database";
import {
  AccionCRUD,
  eliminarKeysVacios,
  enumaBool,
  getCoordenadas,
  guardarDatosAuditoria,
} from "App/Helper/funciones";

import FarmaciaDia from "./FarmaciaDia";
import Dia from "./Dia";
import FarmaciaMedioDePago from "./FarmaciaMedioDePago";
import MedioDePago from "./MedioDePago";
import ProductoCustom from "./ProductoCustom";
import FarmaciaProductoCustom from "./FarmaciaProductoCustom";
import Inventario from "./Inventario";
import FarmaciaInstitucion from "./FarmaciaInstitucion";
import UsuarioPerfil from "./UsuarioPerfil";
import FarmaciaDrogueria from "./FarmaciaDrogueria";
import FarmaciaLaboratorio from "./FarmaciaLaboratorio";
import EventoParticipante from "./EventoParticipante";

export default class Farmacia extends BaseModel {
  public static table = "tbl_farmacia";

  static async traerFarmacias({
    usuario,
    matricula,
    id,
    admin,
  }: {
    usuario?: string;
    matricula?: number;
    id?: number;
    admin?: boolean;
  }): Promise<any> {
    let farmacias =
      await Database.rawQuery(`SELECT f.id, f.id as _id, f.nombre, f.nombrefarmaceutico, 
      f.matricula, f.cufe, f.cuit, f.calle, f.numero, f.cp,
      f.direccioncompleta, f.longitud AS log, 
      f.latitud AS lat, f.costoenvio,
      f.habilitado, f.imagen, f.email, f.telefono, 
      f.whatsapp, 
      f.facebook,
      f.instagram, 
      f.web, 
      f.descubrir, f.envios, f.tiempotardanza, 
      f.ts_creacion as fechaalta,
      f.id as farmaciaid,
      f.visita_comercial, f.telefonofijo, f.f_ultimo_acceso as ultimoacceso,
      ${admin ? "f.*," : ""}
      l.nombre AS localidad, u.usuario AS usuario, 
      p.nombre AS provincia, pf.nombre AS perfil_farmageo, 
      GROUP_CONCAT(DISTINCT mp.nombre) AS mediospagos,
      GROUP_CONCAT(DISTINCT i.id) AS instituciones
      FROM tbl_farmacia AS f
      LEFT JOIN tbl_localidad AS l ON f.id_localidad = l.id
      LEFT JOIN tbl_departamento AS d ON l.id_departamento = d.id
      LEFT JOIN tbl_provincia AS p ON d.id_provincia = p.id
      LEFT JOIN tbl_usuario AS u ON f.id_usuario = u.id
      LEFT JOIN tbl_perfil_farmageo AS pf ON pf.id = f.id_perfil_farmageo
      LEFT JOIN tbl_farmacia_mediodepago AS fmp ON f.id = fmp.id_farmacia AND fmp.habilitado = 's'
      LEFT JOIN tbl_mediodepago AS mp ON fmp.id_mediodepago = mp.id
      LEFT JOIN tbl_farmacia_institucion AS fi ON f.id = fi.id_farmacia AND fi.habilitado = 's'
      LEFT JOIN tbl_institucion AS i ON fi.id_institucion = i.id
      WHERE f.nombre IS NOT NULL 
      
     
      ${usuario ? `AND u.usuario = "${usuario}"` : ""} 
      ${matricula ? `AND f.matricula = ${matricula}` : ""}
      ${id ? `AND f.id = ${id}` : ""}
      GROUP BY f.id`);

    let servicios =
      await Database.rawQuery(`SELECT s.nombre AS tipo, fs.id_farmacia, fs.habilitado, s.auto_asignable, s.orden_web  FROM tbl_farmacia_servicio AS fs
    LEFT JOIN tbl_servicio AS s ON fs.id_servicio = s.id WHERE s.habilitado = "s" and fs.habilitado = "s"`);

    let dias = await Database.rawQuery(
      `SELECT fd.id_farmacia, fd.inicio, fd.fin, fd.habilitado, d.nombre AS dia 
      FROM tbl_farmacia_dia AS fd 
      LEFT JOIN tbl_dia AS d ON fd.id_dia = d.id `
    );

    function dameloshorarios(f, horarios) {
      const dias = horarios.filter((h) => h.id_farmacia === f.id);

      const semana = [
        "lunes",
        "martes",
        "miercoles",
        "jueves",
        "viernes",
        "sabado",
        "domingo",
      ];
      interface bloque {
        bloques: [];
        habilitado: Boolean;
        dia: String;
      }
      let bloqu: [bloque] = [] as unknown as [bloque];

      semana.forEach((dia) => {
        let d2 = dias.filter((d) => d.dia === dia);

        const bloquecitos = d2.map(
          (
            bloque: { inicio: any; fin: any; habilitado: string },
            i: number
          ) => {
            if (bloque.habilitado === "n" && i === 1) return null;
            return {
              desde: bloque.inicio,
              hasta: bloque.fin,
              bloq: i + 1,
            };
          }
        );
        const horarioFarmageo = {
          bloques: bloquecitos.filter((b) => b !== null),
          habilitado: d2.find((d) => d.dia === dia)
            ? d2.find((d) => d.dia === dia).habilitado === "s"
              ? true
              : false
            : false,
          dia: dia,
        };

        if (horarioFarmageo.bloques.length === 0) return;
        return bloqu.push(horarioFarmageo);
      });

      return bloqu;
    }

    farmacias = await Promise.all(
      farmacias[0].map(async (f) => {
        const productosCustom =
          await Database.rawQuery(`SELECT pc.*, pc.id as _id FROM tbl_farmacia_producto_custom AS fpc 
        LEFT JOIN tbl_producto_custom AS pc ON fpc.id_producto_custom = pc.id  
        WHERE fpc.id_farmacia = ${f.id}
        AND fpc.habilitado = 's' 
        AND fpc.en_papelera = 'n'`);

        const productosEnPapelera =
          await Database.rawQuery(`SELECT pc.*, pc.id as _id FROM tbl_farmacia_producto_custom AS fpc 
        LEFT JOIN tbl_producto_custom AS pc ON fpc.id_producto_custom = pc.id  
        WHERE fpc.id_farmacia = ${f.id}
        AND fpc.habilitado = 's' 
        AND fpc.en_papelera = 's'`);

        f.servicios = servicios[0].filter((s) => s.id_farmacia === f.id);

        f.mediospagos = f.mediospagos ? f.mediospagos.split(",") : [];
        f.instituciones = f.instituciones ? f.instituciones.split(",") : [];
        f.horarios = dameloshorarios(f, dias[0]);
        f.productos = productosCustom[0].map((pc) => {
          pc._id = pc._id.toString();
          return enumaBool(pc);
        });
        f.direccioncompleta = `${f.calle} ${f.numero}, ${f.localidad}, ${f.provincia}`;
        f.papeleraProductos = productosEnPapelera[0].map((pc) => {
          pc._id = pc._id.toString();
          return enumaBool(pc);
        });
        f.excepcionesProdFarmageo = [];
        f.excepcionesEntidadesFarmageo = [];
        f.imagen = f.imagen ? f.imagen : "";

        if (admin) {
          let perfil = await UsuarioPerfil.query()
            .preload("perfil")
            .where("id_usuario", f.id_usuario);
          f.id_perfil = perfil[0].perfil.id;
          delete f.instagran;
          delete f.facebook;
          delete f.farmaciaid;
        }
        f = enumaBool(f);
        return f;
      })
    );
    if (farmacias.length === 1) {
      return farmacias[0];
    }

    return farmacias;
  }

  static async actualizarFarmacia({
    usuario,
    d,
    usuarioAuth,
  }: {
    usuario: string;
    d: any;
    usuarioAuth: Usuario;
  }) {
    try {
      //Guardar datos de geolocalizacion
      const localidad = await Database.query()
        .from("tbl_localidad")
        .select(
          Database.raw(
            "tbl_departamento.nombre as departamento, tbl_provincia.nombre as provincia, tbl_localidad.*"
          )
        )
        .where("tbl_localidad.nombre", "LIKE", `%${d.localidad}`)
        .andWhere(
          "tbl_provincia.nombre",
          "=",
          d.provincia ? d.provincia : "Santa Fe"
        )
        .leftJoin(
          "tbl_departamento",
          "tbl_localidad.id_departamento",
          "tbl_departamento.id"
        )
        .leftJoin(
          "tbl_provincia",
          "tbl_departamento.id_provincia",
          "tbl_provincia.id"
        );

      const provincia = d.provincia ? d.provincia : "Santa Fe";
      const pais = "Argentina";
      const direccioncompleta = `${d.calle} ${d.numero}, ${localidad[0].nombre}, ${provincia}, ${pais}`;

      const { lat, lng: log } = await getCoordenadas({
        calle: d.calle,
        numero: d.numero,
        localidad: localidad[0].nombre,
      });

      //Guarda datos de farmacia
      const farmacia = await Farmacia.query()
        .select("tbl_farmacia.*")
        .leftJoin("tbl_usuario as u", "id_usuario", "u.id")
        .where("u.usuario", usuario);

      const perfilesFarmageo = await PerfilFarmageo.query();

      let mergeObject: any = {
        id: d.id,
        nombre: d.nombre,
        nombrefarmaceutico: d.nombrefarmaceutico,
        imagen: d.imagen,
        calle: d.calle,
        numero: d.numero,
        id_localidad: localidad[0].id,
        direccioncompleta: direccioncompleta,

        id_perfil_farmageo: perfilesFarmageo.filter(
          (pf) => pf.nombre === d.perfil_farmageo
        )[0]?.id,

        longitud: log,
        latitud: lat,

        cp: d.cp,
        password: d.password,

        habilitado:
          d.habilitado === "true" || d.habilitado === true ? "s" : "n",
        email: d.email,
        telefono: d.telefono,
        whatsapp: d.whatsapp,
        facebook: d.facebook,
        instagram: d.instagram ? d.instagram : d.instagran,
        web: d.web,
        descubrir:
          typeof d.descubrir !== "undefined" ? (d.descubrir ? "s" : "n") : null,
        envios:
          typeof d.nohagoenvios !== "undefined"
            ? d.nohagoenvios
              ? "n"
              : "s"
            : null,
        costoenvio: d.costoenvio,
        tiempotardanza: d.tiempotardanza,
        visita_comercial:
          typeof d.visita_comercial !== "undefined"
            ? d.visita_comercial
              ? "s"
              : "n"
            : null,
        telefonofijo: d.telefonofijo,
      };
      mergeObject = eliminarKeysVacios(mergeObject);
      farmacia[0].merge(mergeObject);

      guardarDatosAuditoria({
        objeto: farmacia[0],
        usuario: usuarioAuth,
        accion: AccionCRUD.editar,
      });
      await farmacia[0].save();

      //Guarda datos de horarios
      const dias = await Dia.query();

      const horariosQuery = FarmaciaDia.query()
        .select(
          "inicio",
          "fin",
          "tbl_farmacia_dia.habilitado",
          "tbl_farmacia_dia.id",
          "tbl_farmacia_dia.id_dia"
        )
        .preload("dia")
        .leftJoin(
          "tbl_farmacia",
          "tbl_farmacia_dia.id_farmacia",
          "tbl_farmacia.id"
        )
        .where("tbl_farmacia.id", farmacia[0].id);

      const horarios = await horariosQuery;

      const escribirHorarios = (dhorarios, horarios) => {
        let dbloques: {
          inicio: string;
          fin: string;
          dia: string;
          habilitado: string;
        }[] = [];
        dhorarios.forEach((d) => {
          d.bloques.forEach((b) => {
            dbloques.push({
              inicio: b.desde,
              fin: b.hasta,
              dia: d.dia
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase(),
              habilitado: d.habilitado,
            });
          });
        });

        dbloques.forEach((b) => {
          let hMod = horarios.find((h) => h.dia.nombre === b.dia); // bloque a modificar
          if (!hMod) {
            const hModNuevo = new FarmaciaDia();

            hModNuevo.fill({
              inicio: b.inicio,
              fin: b.fin,
              habilitado: b.habilitado ? "s" : "n",
              id_dia: dias.find((d) => d.nombre === b.dia)?.id,
              id_farmacia: farmacia[0].id,
            });

            return hModNuevo.save();
          } // si no existe lo inserto

          hMod.merge({
            inicio: b.inicio,
            fin: b.fin,
            habilitado: b.habilitado ? "s" : "n",
            id: hMod.id,
            id_dia: hMod.id_dia,
          });

          hMod.save();
          horarios = horarios.filter((h) => h.id !== hMod.id); //retiro el bloque modificado de la lista
        });
        if (horarios.length > 0) {
          horarios.forEach((h) => {
            h.habilitado = "n";
            h.save();
          });
        }
      };
      escribirHorarios(d.horarios, horarios);

      //Guardar datos de servicios
      const serviciosPosibles = await Servicio.query();
      const serviciosDB = await FarmaciaServicio.query()
        .preload("servicio")
        .where("id_farmacia", farmacia[0].id);

      const escribirServicios = (serviciosFront, serviciosDB) => {
        // console.log(Date());
        let lista = serviciosDB;
        serviciosFront.forEach((sf) => {
          const servicioM = lista.find(
            (sdb) => sdb.servicio.nombre === sf.tipo
          );

          if (servicioM) {
            servicioM.habilitado = "s";
            lista = lista.filter((l) => servicioM.id !== l.id);
            servicioM.save();
            //console.log(sf.tipo, "habilitado");
          }
          if (!servicioM) {
            const servicioN = new FarmaciaServicio();
            servicioN.fill({
              id_farmacia: farmacia[0].id,
              habilitado: "s",
              id_servicio: serviciosPosibles.filter(
                (sp) => sf.tipo === sp.nombre
              )[0].id,
            });
            //console.log(sf.tipo, "creado");
            servicioN.save();
          }
        });
        if (lista.length > 0) {
          lista.forEach((l) => {
            l.habilitado = "n";
            l.save();
            //console.log(l.servicio.nombre, "deshabilitado");
          });
        }
      };
      escribirServicios(d.servicios, serviciosDB);

      //Guardar datos de medios de pago
      const mediospagosPosibles = await MedioDePago.query();
      const mediospagosDB = await FarmaciaMedioDePago.query()
        .preload("mediodepago")
        .where("id_farmacia", farmacia[0].id);
      const escribirMediosPagos = (mediosFront, mediosDB) => {
        let lista = mediosDB;

        mediosFront.forEach((mf) => {
          const medioM = mediosDB.find((mdb) => mdb.mediodepago.nombre === mf);

          if (medioM) {
            medioM.habilitado = "s";

            lista = lista.filter((l) => medioM.id !== l.id);
            return medioM.save();
          }
          if (!medioM) {
            const medioN = new FarmaciaMedioDePago();
            medioN.fill({
              id_farmacia: farmacia[0].id,
              id_mediodepago: mediospagosPosibles.filter(
                (mpp) => mpp.nombre === mf
              )[0].id,
              habilitado: "s",
            });

            return medioN.save();
          }
        });
        if (lista.length > 0) {
          lista.forEach((l) => {
            l.habilitado = "n";
            l.save();
          });
        }
      };
      escribirMediosPagos(d.mediospagos, mediospagosDB);

      //Actualizar productos propios
      // Agregar prod

      const inventarios = await Inventario.query();
      const productoAgregar = d.productos.filter((p) => !p.id)[0];
      const productosActualizar = d.productos.filter((p) => p.id);

      if (productosActualizar && productosActualizar.length > 0) {
        productosActualizar.map(async (p) => {
          const productoC = await ProductoCustom.findOrFail(p.id);
          productoC.merge({
            descripcion: p.descripcion,
            en_papelera: p.en_papelera ? "s" : "n",
            es_promocion: p.esPromocion ? "s" : "n",
            favorito: p.favorito ? "s" : "n",
            habilitado: p.habilitado ? "s" : "n",
            id_categoria: p.id_categoria,
            imagen: p.imagen,
            nombre: p.nombre,
            precio: p.precio,
            sku: p.sku,
          });
          await productoC.save();
          const farmaciaProdCustomN = await FarmaciaProductoCustom.query()
            .where("id_farmacia", farmacia[0].id)
            .where("id_producto_custom", p.id);

          farmaciaProdCustomN[0].en_papelera = "n";
          farmaciaProdCustomN[0].habilitado = "s";

          farmaciaProdCustomN[0].save();
        });
      }
      if (productoAgregar && productoAgregar.nombre.trim() !== "") {
        // console.log("productosAgregar");
        const productoN = new ProductoCustom();
        productoN.fill({
          nombre: productoAgregar.nombre,
          imagen: productoAgregar.imagen,
          precio: Number(productoAgregar.precio),
          favorito: productoAgregar.favorito ? "s" : "n",
          sku: productoAgregar.sku,
          descripcion: productoAgregar.descripcion,
          id_inventario: inventarios.filter(
            (i) => i.nombre === productoAgregar.inventario
          )[0].id,
        });
        const productoS = await productoN.save();
        const farmaciaProdCustomN = new FarmaciaProductoCustom();
        farmaciaProdCustomN.fill({
          id_farmacia: farmacia[0].id,
          id_producto_custom: productoS.id,
          habilitado: "s",
          en_papelera: "n",
        });
        farmaciaProdCustomN.save();
      }
      if (d.papeleraProductos.length > 0) {
        // console.log("d.papeleraProductos");
        d.papeleraProductos.forEach(async (p) => {
          const FPC = await FarmaciaProductoCustom.query()
            .where("id_producto_custom", p.id)
            .andWhere("id_farmacia", farmacia[0].id);
          FPC[0].en_papelera = "s";
          FPC[0].habilitado = p.habilitado ? "s" : "n";
          FPC[0].save();
        });
      }

      //Actualizar productos Pack >:'(
      return "Terminamos de actualizar papu";
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  static async actualizarFarmaciaAdmin({
    id,
    data,
    usuarioAuth,
  }: {
    id: number;
    data: { usuario: any; farmacia: any; instituciones: any; perfil: any };
    usuarioAuth: Usuario;
  }) {
    id;
    const usuario = await Usuario.findOrFail(data.farmacia.id_usuario);
    const instituciones = await FarmaciaInstitucion.query().where(
      "id_farmacia",
      data.farmacia.id
    );

    if (usuario.usuario !== data.usuario.username) {
      usuario.merge({
        usuario: data.usuario.username,
      });
      await usuario.save();
    }

    await this.actualizarFarmacia({
      usuario: usuario.usuario,
      d: data.farmacia,
      usuarioAuth: usuarioAuth,
    });

    await Promise.all(
      data.instituciones.map((id_institucion: number) => {
        const encontrado = instituciones.find(
          (d) => d.$original.id_institucion === Number(id_institucion)
        );

        if (!encontrado) {
          const farmaciaInstitucion = new FarmaciaInstitucion();
          farmaciaInstitucion.merge({
            id_institucion: Number(id_institucion),
            id_farmacia: data.farmacia.id,
            habilitado: "s",
          });
          return farmaciaInstitucion.save();
        }
        if (encontrado) {
          instituciones.splice(
            instituciones.findIndex((ins) => ins.id === encontrado.id),
            1
          );

          encontrado.merge({
            habilitado: "s",
          });
          return encontrado.save();
        }
      })
    );
    if (instituciones.length > 0) {
      instituciones.forEach((i) => {
        i.merge({ habilitado: "n" });
        i.save();
      });
    }

    if (data.usuario.password !== data.farmacia.password) {
      const farmacia = await Farmacia.findOrFail(data.farmacia.id);
      farmacia.merge({
        password: data.usuario.password,
      });

      try {
        await Usuario.cambiarPassword({
          username: data.usuario.username,
          password: data.usuario.password,
          usuarioAuth: usuarioAuth,
        });
        return await farmacia.save();
      } catch (error) {
        console.log(error);
        return error;
      }
    }

    if (Number(data.perfil) !== data.farmacia.id_perfil) {
      // console.log(
      //   "cambio de perfil ",
      //   data.farmacia.id_perfil,
      //   " a ",
      //   data.perfil
      // );
      const perfilDB = await UsuarioPerfil.findBy(
        "id_usuario",
        data.farmacia.id_usuario
      );

      perfilDB?.merge({ id_perfil: Number(data.perfil) });

      perfilDB?.save();
    }
    return;
  }

  static async crearFarmacia(nuevaFarmacia, auth) {
    const usuarioAuth = await auth.authenticate();

    try {
      const usuario = await Usuario.findByOrFail(
        "usuario",
        nuevaFarmacia.usuario
      );
      const localidad = await Localidad.findBy(
        "nombre",
        nuevaFarmacia.localidad
      );
      const farmaciaN = new Farmacia();
      const { lat, lng: log } = await getCoordenadas({
        calle: nuevaFarmacia.calle,
        numero: nuevaFarmacia.numero,
        localidad: nuevaFarmacia.localidad,
      });

      // console.log("he sido  invocado ", lat, log);

      farmaciaN.merge({
        id_usuario: usuario.id,
        nombrefarmaceutico: nuevaFarmacia.nombrefarmaceutico,
        matricula: nuevaFarmacia.matricula,
        id_localidad: localidad?.id,
        nombre: nuevaFarmacia.nombre,
        cuit: nuevaFarmacia.cuit,
        cufe: nuevaFarmacia.cufe,
        email: nuevaFarmacia.email,
        telefono: nuevaFarmacia.telefono,
        calle: nuevaFarmacia.calle,
        numero: Number(nuevaFarmacia.numero),
        tiempotardanza: nuevaFarmacia.tiempotardanza,
        latitud: lat,
        longitud: log,
        password: nuevaFarmacia.password,
        id_perfil_farmageo: 2,
        cp: nuevaFarmacia.cp,
      });

      guardarDatosAuditoria({
        objeto: farmaciaN,
        usuario: usuarioAuth,
        accion: AccionCRUD.crear,
      });
      await farmaciaN.save();

      nuevaFarmacia.instituciones.forEach((id_institucion) => {
        const farmaciaInstitucion = new FarmaciaInstitucion();
        farmaciaInstitucion.merge({
          id_institucion: Number(id_institucion),
          id_farmacia: farmaciaN.id,
        });

        farmaciaInstitucion.save();
      });
      return farmaciaN;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  @column({ isPrimary: true })
  public id: number;

  @column()
  public password: string;

  @column()
  public nombre: string;

  @column()
  public nombrefarmaceutico: string;

  @column()
  public matricula: number;

  @column()
  public cufe: number;

  @column()
  public cuit: string;

  @column()
  public calle: string;

  @column()
  public numero: number;

  @column()
  public direccioncompleta: string;

  @column()
  public cp: string;

  @column()
  public longitud: string;

  @column()
  public latitud: string;

  @column()
  public habilitado: string;

  @column()
  public email: string;

  @column()
  public telefono: string;

  @column()
  public whatsapp: string;

  @column()
  public facebook: string;

  @column()
  public instagram: string;

  @column()
  public imagen: string;

  @column()
  public web: string;

  @column()
  public descubrir: string;

  @column()
  public envios: string;

  @column()
  public costoenvio: string;

  @column()
  public tiempotardanza: string;

  @column()
  public visita_comercial: string;

  @column()
  public telefonofijo: string;

  @column()
  public id_perfil_farmageo: number;

  @column()
  public f_ultimo_acceso: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_localidad?: number;

  @column()
  public id_usuario: number;
  
  @column()
  public id_comisionista_facturacion: number;

  public usuarioUsuario: string;

  //foreing key
  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario",
  })
  public usuario: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Localidad, {
    foreignKey: "id",
    localKey: "id_localidad",
  })
  public localidad: HasOne<typeof Localidad>;

  @hasOne(() => PerfilFarmageo, {
    foreignKey: "id",
    localKey: "id_perfil_farmageo",
  })
  public perfil_farmageo: HasOne<typeof PerfilFarmageo>;

  @hasManyThrough([() => Servicio, () => FarmaciaServicio], {
    localKey: "id",
    foreignKey: "id_farmacia",
    throughLocalKey: "id_servicio",
    throughForeignKey: "id",
  })
  public servicios: HasManyThrough<typeof Servicio>;

  @hasMany(() => FarmaciaDrogueria, {
    foreignKey: "id_farmacia",
  })
  public nro_cuenta_drogueria: HasMany<typeof FarmaciaDrogueria>;

  @hasMany(() => FarmaciaLaboratorio, {
    foreignKey: "id_farmacia",
  })
  public nro_cuenta_laboratorio: HasMany<typeof FarmaciaLaboratorio>;

  @hasMany(() => EventoParticipante, {
    foreignKey: "id_farmacia",
    localKey: "id",
  })
  public invitados: HasMany<typeof EventoParticipante>;

  // public serializeExtras = true;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      if (k === "_id") return (extras[k] = this.$extras[k].toString());
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
