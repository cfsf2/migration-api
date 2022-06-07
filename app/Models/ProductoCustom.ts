import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Inventario from "./Inventario";
import Usuario from "./Usuario";
import Categoria from "./Categoria";

export default class ProductoCustom extends BaseModel {
  public static table = "tbl_producto_custom";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public descripcion: string;

  @column({ serializeAs: "esPromocion" })
  public es_promocion: string;

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
  public id_inventario: number;

  @column()
  public en_papelera: string;

  @column()
  public id_categoria: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Inventario, {
    foreignKey: "id",
    localKey: "id_inventario",
  })
  public inventario: HasOne<typeof Inventario>;

  @hasOne(() => Categoria, {
    foreignKey: "id",
    localKey: "id_categoria",
  })
  public categoria: HasOne<typeof Categoria>;

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
}
