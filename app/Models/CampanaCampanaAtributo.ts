import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Campana from "./Campana";
import CampanaAtributo from "./CampanaAtributo";
import Usuario from "./Usuario";

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

  @column()
  public id_campana: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @hasOne(() => Campana, {
    foreignKey: "id",
  })
  public campana: HasOne<typeof Campana>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => CampanaAtributo, {
    foreignKey: "id",
    localKey: "id_campana_atributo",
    serializeAs: "atributos",
  })
  public atributo: HasOne<typeof CampanaAtributo>;
}
