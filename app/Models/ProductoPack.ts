import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Categoria from "./Categoria";
import Entidad from "./Entidad";
import Database from "@ioc:Adonis/Lucid/Database";

export default class ProductoPack extends BaseModel {
  static async traerProductosPacks({
    entidad,
    habilitado,
    producto,
    en_papelera,
  }: {
    entidad?: string;
    producto?: number;
    habilitado?: string;
    en_papelera?: string;
  }) {
    const datos = await Database.rawQuery(
      ` SELECT pp.*, 
      pp.id as _id,
      pp.ts_creacion as fechaalta,
      pp.precio_con_iva as precio_con_IVA,
      IF ( pp.id_categoria is NULL, '', pp.id_categoria ) as categoria_id, 
      IF ( pp.id_entidad is NULL, '', pp.id_entidad) as entidad_id 
      FROM tbl_producto_pack as pp 
      WHERE 1 = 1
      ${en_papelera ? `AND pp.en_papelera =  "${en_papelera}"` : ""}
      ${habilitado ? `AND pp.habilitado = "${habilitado}"` : ""}
      ${producto ? "AND pp.id = " + producto : ""}
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
    return arrNuevo.length > 0 ? arrNuevo : null;
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
  public id_entidad: number;

  @column()
  public id_categoria: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number; //foreing key

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
