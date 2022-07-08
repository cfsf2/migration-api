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
  public id_departamento: number;

  @column()
  public cp: number;

  @hasOne(() => Departamento, {
    foreignKey: "id",
    localKey: "id_departamento",
  })
  public departamento: HasOne<typeof Departamento>;

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
