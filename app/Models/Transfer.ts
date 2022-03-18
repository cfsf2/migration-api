import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Farmacia from "./Farmacia";
import Drogueria from "./Drogueria";

export default class Transfer extends BaseModel {
  public static table = "tbl_transfer";

  @column({ isPrimary: true })
  public id: number;

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

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Farmacia, {
    foreignKey: "id",
  })
  public id_farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Drogueria, {
    foreignKey: "id",
  })
  public id_drogueria: HasOne<typeof Drogueria>;

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
  })
  public id_laboratorio: HasOne<typeof Laboratorio>;

  @hasOne(() => EstadoTransfer, {
    foreignKey: "id",
  })
  public id_estado_transfer: HasOne<typeof EstadoTransfer>;
}
