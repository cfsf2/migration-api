import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Laboratorio from "./Laboratorio";
import Database from "@ioc:Adonis/Lucid/Database";

export default class TransferProducto extends BaseModel {
  static async traerTrasferProducto({
    en_papelera,
    habilitado,
  }: {
    en_papelera?: string;
    habilitado?: string;
  }) {
    const trasfersProducto = await Database.from("tbl_transfer_producto as tp")
      .select(
        "*",
        "tp.id as id",
        "tp.habilitado as habilitado",
        "tp.nombre as nombre",
        "tp.codigo as codigo",
        "tp.ts_creacion as fechaalta",
        "tp.ts_creacion as fecha_alta",
        "tp.ts_modificacion as fecha_modificacion",
        "l.id as laboratorioid",
        "u.id_usuario_creacion as id_usuario_alta",
        "u.id_usuario_modificacion as id_usuario_modificacion"
      )

      .leftJoin("tbl_laboratorio as l", "tp.id_laboratorio", "l.id")
      .leftJoin("tbl_usuario as u", "tp.id", "u.id")
      //en_papelera
      .if(en_papelera, (query) => {
        query.where("tp.en_papelera", "n");
      })
      .if(habilitado, (query) => {
        query.where("tp.habilitado", "s");
      })

      .orderBy("codigo", "desc");

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
