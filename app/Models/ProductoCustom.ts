import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Inventario from "./Inventario";
import Usuario from "./Usuario";

export default class ProductoCustom extends BaseModel {
  public static table = "tbl_producto_custom";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public descripcion: string;

  @column()
  public nombre: string;

  @column()
  public imagen: string;

  @column()
  public habilitado: string;

  @column()
  public favorito: string;

  @column()
  public precio: number;

  @column()
  public sku: string;

  @column()
  public inventario: number;

  @column()
  public en_papelera: string;

  @column()
  public id_categoria: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Inventario, {
    foreignKey: "id",
  })
  public id_inventario: HasOne<typeof Inventario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;
}
