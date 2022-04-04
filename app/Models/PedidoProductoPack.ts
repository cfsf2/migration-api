import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Pedido from "./Pedido";
import ProductoPack from "./ProductoPack";
import ProductoCustom from "./ProductoCustom";

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

  @column()
  public id_pedido: number;

  @column()
  public id_productospack: number;

  @column()
  public id_producto_custom: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Pedido, {
    foreignKey: "id",
  })
  public pedido: HasOne<typeof Pedido>;

  @hasOne(() => ProductoPack, {
    foreignKey: "id",
    serializeAs: "producto",
  })
  public producto_pack: HasOne<typeof ProductoPack>;

  @hasOne(() => ProductoCustom, {
    foreignKey: "id",
    serializeAs: "producto",
  })
  public producto_custom: HasOne<typeof ProductoCustom>;
}
