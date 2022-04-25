import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  hasManyThrough,
  HasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Farmacia from "./Farmacia";
import Drogueria from "./Drogueria";
import EstadoTransfer from "./EstadoTransfer";
import Laboratorio from "./Laboratorio";
import Database from "@ioc:Adonis/Lucid/Database";
import TransferProducto from "./TransferProducto";
import TransferTransferProducto from "./TransferTransferProducto";

export default class Transfer extends BaseModel {
  static async traerTransfers() {
    const transfers = await Database.from("tbl_transfer as t")
      .select(
        "*",
        "t.id as id",
        "t.id as _id",
        "t.ts_modificacion as fecha_modificacion",
        "t.ts_creacion as fecha_alta",
        "d.nombre as drogueria_id",
        "f.matricula as farmacia_id",
        "f.nombre as farmacia_nombre",
        "et.nombre as estado",
        "u.id_usuario_creacion as id_usuario_creacion",
        "u.id_usuario_modificacion as ultima_modificacion"
      )

      .leftJoin("tbl_drogueria as d", "t.id_drogueria", "d.id")
      .leftJoin("tbl_farmacia as f", "t.id", "f.id")
      .leftJoin("tbl_estado_transfer as et", "t.id_transfer_estado", "et.id")
      .leftJoin("tbl_usuario as u", "t.id", "u.id")
      .orderBy("fecha_alta", "desc");

    return transfers;
  }

  static async guardar(data) {
    const nuevoTransfer = new Transfer();
    // console.log(data);
    nuevoTransfer.merge({
      nro_cuenta_drogueria: data.nro_cuenta_drogueria,
      id_drogueria: data.drogueria_id,
      id_laboratorio: data.laboratorio_id,
      id_transfer_estado: 1,
    });
  }
  public static table = "tbl_transfer";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_drogueria: number;

  @column()
  public id_laboratorio: number;

  @column()
  public id_farmacia: number;

  @column()
  public matricula: number;

  @column.dateTime({ autoCreate: true })
  public fecha: DateTime;

  @column()
  public id_transfer_estado: number;

  @column()
  public nro_cuenta_drogueria: string;

  @column()
  public email_destinatario: string;

  @column()
  public productos_solicitados: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key

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

  @hasOne(() => Farmacia, {
    foreignKey: "id",
    localKey: "id_farmacia",
  })
  public farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Drogueria, {
    foreignKey: "id",
    localKey: "id_drogueria",
  })
  public drogueria: HasOne<typeof Drogueria>;

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
    localKey: "id_laboratorio",
  })
  public laboratorio: HasOne<typeof Laboratorio>;

  @hasOne(() => EstadoTransfer, {
    foreignKey: "id",
    localKey: "id_estado_transfer",
  })
  public estado_transfer: HasOne<typeof EstadoTransfer>;

  @hasManyThrough([() => TransferProducto, () => TransferTransferProducto], {
    localKey: "id",
    foreignKey: "id_transfer",
    throughLocalKey: "id_transfer_producto",
    throughForeignKey: "id",
  })
  public productos: HasManyThrough<typeof TransferProducto>;
}
