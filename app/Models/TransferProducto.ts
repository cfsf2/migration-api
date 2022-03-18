import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";

export default class TransferProducto extends BaseModel {
  public static table = "tbl_transfer_producto";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public habilitado: string;

  @column()
  public presentacion: string;

  @column()
  public cantidad_minima: number;

  @column()
  public descuento_porcentaje: number;

  @column()
  public precio: number;

  @column()
  public codigo: string;

  @column()
  public en_papelera: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
  })
  public id_laboratorio: HasOne<typeof Laboratorio>;
}
