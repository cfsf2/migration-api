import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Campana from "./Campana";
import CampanaOrientado from "./CampanaOrientado";

export default class CampanaCampanaOrientado extends BaseModel {
  public static table = "tbl_campana_campana_orientado";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_campana: number;

  @column()
  public id_campana_orientado: number;

  @hasOne(() => Campana, {
    foreignKey: "id",
  })
  public campana: HasOne<typeof Campana>;

  @hasOne(() => CampanaOrientado, {
    foreignKey: "id",
  })
  public campana_orientado: HasOne<typeof CampanaOrientado>;
}
