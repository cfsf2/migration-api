import { DateTime } from "luxon";
import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Usuario from "./Usuario";
import Campana from "./Campana";

export default class CampanaRequerimiento extends BaseModel {
  public static table = "tbl_campana_requerimiento";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public finalizado: string;

  @column()
  public celular: string;

  @column()
  public codigo_promo: string;

  @column()
  public texto_mensaje: string;

  @column()
  public id_campana: number;

  @column()
  public id_usuario: number;
  
  @column()
  public id_farmacia: number;

  @column()
  public id_usuario_creacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => Campana, {
    foreignKey: "id",
  })
  public campana: HasOne<typeof Campana>;

  @hasOne(() => Farmacia, {
    foreignKey: "id",
  })
  public farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario: HasOne<typeof Usuario>;
}
