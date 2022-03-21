import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Usuario from "./Usuario";
import EstadoPedido from "./EstadoPedido";

export default class Pedido extends BaseModel {
  public static table = "tbl_pedido";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public descripcion: string;

  @column()
  public comentario: string;

  @column()
  public costoenvio: string;

  @column()
  public domicilioenvio: string;

  @column()
  public gruposproductos: string;

  @column()
  public pago_online: string;

  @column()
  public envio: string;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public fechaentrega: DateTime;

  @column()
  public es_invitado: string;

  @column()
  public id_socio: string;

  @column()
  public datos_cliente: string;

  @column()
  public origen: string;

  @column()
  public username: string;

  @column()
  public nombrefarmacia: string;

  @column()
  public whatsapp: string;

  @column()
  public obra_social: string;

  @column()
  public obra_social_frente: string;

  @column()
  public obra_social_dorso: string;

  @column()
  public receta: string;

  @column()
  public total: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => Farmacia, {
    foreignKey: "id",
  })
  public id_farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => EstadoPedido, {
    foreignKey: "id",
  })
  public id_estado_pedido: HasOne<typeof EstadoPedido>;
}
