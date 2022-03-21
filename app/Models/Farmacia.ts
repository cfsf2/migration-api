import { DateTime } from "luxon";
<<<<<<< HEAD
import Usuario from "./Usuario";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
=======
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Localidad from "./Localidad";
import PerfilFarmageo from "./PerfilFarmageo";
>>>>>>> models

export default class Farmacia extends BaseModel {
  public static table = "tbl_farmacia";

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
<<<<<<< HEAD
  public id_perfil_farmageo: number;

  @column()
=======
>>>>>>> models
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

<<<<<<< HEAD
  @column()
  public id_usuario_creacion: number;

=======
>>>>>>> models
  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario: HasOne<typeof Usuario>;
<<<<<<< HEAD
=======

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Localidad, {
    foreignKey: "id",
  })
  public id_localidad: HasOne<typeof Localidad>;

  @hasOne(() => PerfilFarmageo, {
    foreignKey: "id",
  })
  public id_perfil_farmageo: HasOne<typeof PerfilFarmageo>;
>>>>>>> models
}
