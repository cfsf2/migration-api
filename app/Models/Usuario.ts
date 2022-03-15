import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Usuario extends BaseModel {

  public static table = 'tbl_usuario';

  @column({ isPrimary: true })
  public id: number

  @column()
  public usuario: string;

  @column()
  public nombre: string;

  @column()
  public apellido: string;

  @column()
  public dni: Number;

  @column()
  public fecha_nac: Date

  @column()
  public id_localidad: number

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public newsletter: string

  @column()
  public habilitado: string

  @column()
  public esfarmacia: string

  @column()
  public admin: string

  @column()
  public confirmado: string

  @column()
  public telefono: string

  @column.dateTime()
  public f_ultimo_acceso: DateTime

  @column()
  public deleted: string

  @column()
  public demolab: string

  @column()
  public id_wp: string

  @column()
  public id_usuario_creacion: number

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime

  @column()
  public id_usuario_modificacion: number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime

  @column()
  public celular: string
}
