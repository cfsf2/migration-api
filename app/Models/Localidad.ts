import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Departamento from "./Departamento";

export default class Localidad extends BaseModel {
  public static table = "tbl_localidad";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public centroide_lon: string;

  @column()
  public centroide_lat: string;

  @column()
  public cp: number;

  @hasOne(() => Departamento, {
    foreignKey: "id",
  })
  public id_departamento: HasOne<typeof Departamento>;
}
