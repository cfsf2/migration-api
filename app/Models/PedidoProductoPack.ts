import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Pedido from "./Pedido";
import ProductoPack from "./ProductoPack";

export default class PedidoProductoPack extends BaseModel {
  public static table = "tbl_pedido_producto_pack";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public cantidad: number;

  @column()
  public precio: number;

  @column()
  public subtotal: number;

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

  @hasOne(() => Pedido, {
    foreignKey: "id",
  })
  public id_pedido: HasOne<typeof Pedido>;

  @hasOne(() => ProductoPack, {
    foreignKey: "id",
  })
  public id_productospack: HasOne<typeof ProductoPack>;
}
