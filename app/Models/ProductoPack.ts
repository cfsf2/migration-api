import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Categoria from "./Categoria";
import Entidad from "./Entidad";

export default class ProductoPack extends BaseModel {
  public static table = "tbl_producto_pack";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public sku: string;

  @column()
  public descripcion: string;

  @column()
  public en_papelera: string;

  @column()
  public imagen: string;

  @column()
  public habilitado: string;

  @column()
  public precio: number;

  @column()
  public precio_con_iva: number;

  @column()
  public rentabilidad: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => Categoria, {
    foreignKey: "id",
  })
  public id_categoria: HasOne<typeof Categoria>;

  @hasOne(() => Entidad, {
    foreignKey: "id",
  })
  public id_entidad: HasOne<typeof Entidad>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;
}
