import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  HasMany,
  hasMany,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Localidad from "./Localidad";
import CampanaRequerimiento from "./CampanaRequerimiento";
import CampanaOrientado from "./CampanaOrientado";

export default class Usuario extends BaseModel {
  public static table = "tbl_usuario";

  @column({ isPrimary: true })
  public id: Number;

  @column()
  public usuario: String;

  @column()
  public nombre: String;

  @column()
  public apellido: String;

  @column()
  public dni: Number;

  @column()
  public fecha_nac: Date;

  @column()
  public email: String;

  @column({ serializeAs: null })
  public password: String;

  @column()
  public newsletter: String;

  @column()
  public habilitado: String;

  @column()
  public esfarmacia: String;

  @column()
  public admin: String;

  @column()
  public confirmado: String;

  @column()
  public telefono: String;

  @column.dateTime()
  public f_ultimo_acceso: DateTime;

  @column()
  public deleted: String;

  @column()
  public demolab: String;

  @column()
  public id_wp: String;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public celular: String;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Localidad, {
    foreignKey: "id",
  })
  public id_localidad: HasOne<typeof Localidad>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasMany(() => CampanaRequerimiento, {
    foreignKey: "id_usuario",
  })
  public requerimientos: HasMany<typeof CampanaRequerimiento>;

  // Campos locos especificamente diseñados para que siga funcionando la aplicacion sin cambiar el frontend
  public give_user_display_name() {
    return this.nombre + " " + this.apellido;
  }
  @column()
  public user_display_name: String;

  @column()
  public user_email: String;

  @column()
  public token: String;
}
