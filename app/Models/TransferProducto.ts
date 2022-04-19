import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Laboratorio from "./Laboratorio";
import Database from "@ioc:Adonis/Lucid/Database";

export default class TransferProducto extends BaseModel {
  static async traerTrasferProducto() {
    const trasfersProducto = await Database.from("tbl_transfer_producto as tp")
      .select(
        "*",
        "tp.ts_creacion as fechaalta",
        "tp.ts_creacion as fecha_alta",
        "ts_modificacion as fecha_modificacion",
        ""

      )
      .leftJoin("tbl_laboratorio as l", "tp.id_laboratorio", "l.id")
      .where("tp.id", "1");
    return trasfersProducto;
  }
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

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_laboratorio: number;

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

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
    localKey: "id_laboratorio",
  })
  public laboratorio: HasOne<typeof Laboratorio>;
}
