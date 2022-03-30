import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Categoria from "./Categoria";
import Entidad from "./Entidad";
import Database from "@ioc:Adonis/Lucid/Database";

export default class ProductoPack extends BaseModel {
  static async traerProductosPacks({ entidad }: { entidad?: String }) {
    const datos = await Database.rawQuery(
      ` SELECT pp.*,   
      IF ( pp.id_categoria is NULL, '', pp.id_categoria ) as categoria_id, pp.id_entidad as entidad_id 
      FROM tbl_producto_pack as pp 
      WHERE pp.habilitado = "s" AND pp.en_papelera = "n"
      ${entidad ? "AND pp.id_entidad = " + entidad : ""}`
    );

    const arrNuevo = datos[0].map((e) => {
      const claves = Object.keys(e);
      claves.forEach((k) => {
        if (e[k] === "s") {
          e[k] = true;
        }
        if (e[k] === "n") {
          e[k] = false;
        }
      });

      return e;
    });
    console.log(arrNuevo);
    return arrNuevo;
  }

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

  @column()
  public id_entidad: Number;

  @column()
  public id_categoria: Number;

  @column()
  public id_usuario_creacion: Number;

  @column()
  public id_usuario_modificacion: Number; //foreing key

  @hasOne(() => Categoria, {
    foreignKey: "id",
    localKey: "categoria",
  })
  public categoria: HasOne<typeof Categoria>;

  @hasOne(() => Entidad, {
    foreignKey: "id",
    localKey: "entidad",
  })
  public entidad: HasOne<typeof Entidad>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;
}
