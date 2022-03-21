import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Campana from "./Campana";
import CampanaOrientado from "./CampanaOrientado";

export default class CampanaCampanaOrientado extends BaseModel {
  public static table = "tbl_campana_campana_orientado";

  @column({ isPrimary: true })
  public id: number;

  @hasOne(() => Campana, {
    foreignKey: "id",
  })
  public id_campana: HasOne<typeof Campana>;

  @hasOne(() => CampanaOrientado, {
    foreignKey: "id",
  })
  public id_campana_orientado: HasOne<typeof CampanaOrientado>;
}
