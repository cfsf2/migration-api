import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Provincia from "./Provincia";

export default class Departamento extends BaseModel {
  public static table = "tbl_departamento";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public centroide_lon: string;

  @column()
  public centroide_lat: string;

  @column()
  public id_provincia: number;

  @hasOne(() => Provincia, {
    foreignKey: "id",
    localKey: "id_provincia",
  })
  public provincia: HasOne<typeof Provincia>;
}
