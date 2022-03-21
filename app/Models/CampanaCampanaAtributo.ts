import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Campana from "./Campana";
import CampanaAtributo from "./CampanaAtributo";

export default class CampanaCampanaAtributo extends BaseModel {
  public static table = "tbl_campana_campana_atributo";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_campana_atributo: number;

  @column()
  public valor: string;

  @column()
  public sql: string;

  @hasOne(() => Campana, {
    foreignKey: "id",
  })
  public id_campana: HasOne<typeof Campana>;

  @hasOne(() => CampanaAtributo, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof CampanaAtributo>;
}
