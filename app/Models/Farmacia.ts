import { DateTime } from "luxon";
import {
  BaseModel,
  column,
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

export default class Farmacia extends BaseModel {
  public static table = "tbl_farmacia";

  static async traerFarmacias() {
    let farmacias =
      await Database.rawQuery(`SELECT f.id, f.nombre, f.nombrefarmaceutico, f.matricula, f.cufe, f.cuit, f.calle, f.numero, f.direccioncompleta, f.longitud AS log, f.latitud AS lat, f.habilitado, f.imagen, f.email, f.telefono, f.whatsapp, f.facebook, f.instagram, f.web, f.descubrir, f.envios, f.tiempotardanza, f.visita_comercial, f.telefonofijo, f.f_ultimo_acceso as ultimoacceso,
      l.nombre AS localidad, u.usuario AS usuario , 
      p.nombre AS provincia, pf.nombre AS perfil_farmageo, 
      GROUP_CONCAT(mp.nombre) AS mediospagos
      FROM tbl_farmacia AS f
      LEFT JOIN tbl_localidad AS l ON f.id_localidad = l.id
      LEFT JOIN tbl_departamento AS d ON l.id_departamento = d.id
      LEFT JOIN tbl_provincia AS p ON d.id_provincia = p.id
      LEFT JOIN tbl_usuario AS u ON f.id_usuario = u.id
      LEFT JOIN tbl_perfil_farmageo AS pf ON pf.id = f.id_perfil_farmageo
      LEFT JOIN tbl_farmacia_mediodepago AS fmp ON f.id = fmp.id_farmacia
      LEFT JOIN tbl_mediodepago AS mp ON fmp.id_mediodepago = mp.id
      GROUP BY f.id`);

    let servicios =
      await Database.rawQuery(`SELECT s.nombre AS tipo, fs.id_farmacia  FROM tbl_farmacia_servicio AS fs
    LEFT JOIN tbl_servicio AS s ON fs.id_servicio = s.id WHERE s.habilitado = "s"`);

    let dias = await Database.rawQuery(
      `SELECT fd.id_farmacia, fd.inicio, fd.fin, fd.habilitado, d.nombre AS dia FROM tbl_farmacia_dia AS fd LEFT JOIN tbl_dia AS d ON fd.id_dia = d.id  `
    );

    function arrayzar(modelo, key) {
      modelo[key] = modelo[key] ? modelo[key].split(",") : modelo;
      let res = modelo;
      return res;
    }

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

        const bloquecitos = d2.map((bloque, i) => {
          return {
            desde: bloque.inicio,
            hasta: bloque.fin,
            bloq: i + 1,
          };
        });

        const horarioFarmageo = {
          bloques: bloquecitos,
          habilitado: bloquecitos.length > 0 ? true : false,
          dia: dia,
        };
        return bloqu.push(horarioFarmageo);
      });

      return bloqu;
    }

    farmacias = farmacias[0].map((f, ix) => {
      f.servicios = servicios[0].filter((s) => s.id_farmacia === f.id);
      f.mediospagos = f.mediospagos?.split(",");
      f.horarios = dameloshorarios(f, dias[0]);
      return f;
    });

    return farmacias;
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

  @column.dateTime()
  public f_ultimo_acceso: DateTime;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_localidad: Number;

  //foreing key
  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Localidad, {
    foreignKey: "id",
    localKey: "id_localidad",
  })
  public localidad: HasOne<typeof Localidad>;

  @hasOne(() => PerfilFarmageo, {
    foreignKey: "id",
  })
  public id_perfil_farmageo: HasOne<typeof PerfilFarmageo>;

  @hasManyThrough([() => Servicio, () => FarmaciaServicio], {
    localKey: "id",
    foreignKey: "id_farmacia",
    throughLocalKey: "id_servicio",
    throughForeignKey: "id",
  })
  public servicios: HasManyThrough<typeof Servicio>;
}
