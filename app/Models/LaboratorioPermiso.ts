import { column } from '@ioc:Adonis/Lucid/Orm'
import Base from './Base';

export default class LaboratorioPermiso extends Base {
  public static table = "tbl_laboratorio_permiso";

  @column({ isPrimary: true })
  public id: number

  @column()
  public id_laboratorio:number;

  @column()
  public id_permiso:number;
}
