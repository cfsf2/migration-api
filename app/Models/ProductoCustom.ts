import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
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

  @belongsTo(() => Categoria, {
    localKey: "id",
    foreignKey: "id_categoria",
  })
  public categoria: BelongsTo<typeof Categoria>;

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

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      if (k === "_id") return (extras[k] = this.$extras[k].toString());
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
