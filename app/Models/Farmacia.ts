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

  static traerFarmacias() {
    return Database.rawQuery(`SELECT f.id, f.nombre, f.nombrefarmaceutico, f.matricula, f.cufe, f.cuit, f.calle, f.numero, f.direccioncompleta, f.longitud, f.latitud, f.habilitado, f.imagen, f.email, f.telefono, f.whatsapp, f.facebook, f.instagram, f.web, f.descubrir, f.envios, f.tiempotardanza, f.visita_comercial, f.telefonofijo, f.f_ultimo_acceso,
    l.nombre AS localidad, u.usuario AS usuario  FROM tbl_farmacia AS f
    LEFT JOIN tbl_localidad AS l ON f.id_localidad = l.id
    LEFT JOIN tbl_usuario AS u ON f.id_usuario = u.id`);
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
