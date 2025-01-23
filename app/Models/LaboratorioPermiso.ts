import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class LaboratorioPermiso extends BaseModel {
  public static table = "tbl_laboratorio_permiso";

  @column({ isPrimary: true })
  public id: number

  @column()
  public id_laboratorio:number;

  @column()
  public id_permiso:number;
}
