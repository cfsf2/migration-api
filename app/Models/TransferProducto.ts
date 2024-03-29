import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  // HasMany,
  // hasMany,
  hasManyThrough,
  HasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Laboratorio from "./Laboratorio";
import Database from "@ioc:Adonis/Lucid/Database";
import TransferProductoInstitucion from "./TransferProductoInstitucion";
import {
  AccionCRUD,
  eliminarKeysVacios,
  enumaBool,
  guardarDatosAuditoria,
} from "App/Helper/funciones";
import Institucion from "./Institucion";
import Producto from "./Producto";
import Barextra from "./Barextra";

export default class TransferProducto extends BaseModel {
  static async traerTrasferProducto({
    en_papelera,
    habilitado,
    labid,
    instituciones,
  }: {
    en_papelera?: string;
    habilitado?: string;
    labid?: number;
    instituciones?: number[];
  }) {
    // console.log(instituciones);
    const trasfersProducto = await Database.from("tbl_transfer_producto as tp")
      .select(
        "tp.*",
        "tp.id as _id",
        "tp.id as id",
        "tp.habilitado as habilitado",
        "tp.nombre as nombre",
        "tp.codigo as codigo",
        "tp.imagen as imagen",
        "tp.ts_creacion as fechaalta",
        "tp.ts_creacion as fecha_alta",
        "tp.ts_modificacion as fecha_modificacion",
        "l.id as laboratorioid",
        "u.id_usuario_creacion as id_usuario_alta",
        "u.id_usuario_modificacion as id_usuario_modificacion"
      )
      .leftJoin("tbl_laboratorio as l", "tp.id_laboratorio", "l.id")
      .leftJoin("tbl_usuario as u", "tp.id", "u.id")
      .if(instituciones, (query) =>
        query
          .leftJoin(
            "tbl_transfer_producto_institucion as tpi",
            "tpi.id_transfer_producto",
            "tp.id"
          )
          .whereIn("tpi.id_institucion", instituciones as unknown as string[])
          .groupBy("tpi.id_transfer_producto")
      )
      //en_papelera
      .if(en_papelera, (query) => {
        query.where("tp.en_papelera", "n");
      })
      .if(habilitado, (query) => {
        query.where("tp.habilitado", "s");
      })
      .if(labid, (query) => query.where("l.id", labid as number))
      .orderBy("codigo", "desc");

    return trasfersProducto.map((t) => {
      t._id = t._id.toString();
      t.laboratorioid = t.laboratorioid?.toString();
      return enumaBool(t);
    });
  }

  static async agregar(data, usuario) {
    const nuevoPF = new TransferProducto();

    const instituciones = data.instituciones;

    delete data.instituciones;
    try {
      nuevoPF.merge({
        id_laboratorio: data.laboratorioid,
        nombre: data.nombre,
        habilitado: "s",
        presentacion: data.presentacion,
        imagen: data.imagen,
        cantidad_minima: data.cantidad_minima,
        descuento_porcentaje: data.descuento_porcentaje.replace(/[^0-9.,]/g, ''),
        precio: data.precio,
        codigo: data.codigo.substring(0, 15),
      });
      guardarDatosAuditoria({
        objeto: nuevoPF,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      await nuevoPF.save();

      instituciones.forEach((i) => {
        const institucionPF = new TransferProductoInstitucion();
        institucionPF.merge({
          id_transfer_producto: nuevoPF.id,
          id_institucion: i,
        });

        institucionPF.save();
      });
      return nuevoPF;
    } catch (err) {
      console.log(err, "TransferProducto.agregar");
      return err;
    }
  }

  static async actualizar(id, data, usuario) {
    const transferProducto = await TransferProducto.findOrFail(id);

    const mergeObject: TransferProducto | any = {
      id_laboratorio: data.productosTransfers.laboratorioid,
      nombre: data.productosTransfers.nombre,
      habilitado:
        typeof data.productosTransfers.habilitado !== "undefined"
          ? data.productosTransfers.habilitado
            ? "s"
            : "n"
          : null,
      presentacion: data.productosTransfers.presentacion,
      imagen: data.productosTransfers.imagen,
      cantidad_minima: data.productosTransfers.cantidad_minima,
      descuento_porcentaje:
        data.productosTransfers.descuento_porcentaje.replace(/[^0-9.,]/g, ''),
      precio: data.productosTransfers.precio,
      codigo: data.productosTransfers.codigo.substring(0, 15),
      en_papelera:
        typeof data.productosTransfers.en_papelera !== "undefined"
          ? data.productosTransfers.en_papelera
            ? "s"
            : "n"
          : null,
    };

    transferProducto.merge(eliminarKeysVacios(mergeObject));
    try {
      guardarDatosAuditoria({
        objeto: transferProducto,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      await transferProducto.save();

      let instDB = data.productosTransfers.instituciones;

      if (data.instituciones) {
        data.instituciones.forEach(async (i) => {
          if (instDB.includes(i)) {
            return instDB.splice(
              instDB.findIndex((e) => e == i),
              1
            );
          }

          await TransferProductoInstitucion.create({
            id_institucion: i,
            id_transfer_producto: data.productosTransfers.id,
          });
        });

        instDB.forEach(async (i) => {
          const relacion = await TransferProductoInstitucion.query()
            .where("id_institucion", i)
            .andWhere("id_transfer_producto", data.productosTransfers.id);
          relacion[0].delete();
        });
      }
      return;
    } catch (err) {
      console.log(err, "TransferProducto.actualizar");
      return err;
    }
  }
  public static table = "tbl_transfer_producto";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public imagen: string;

  @column()
  public habilitado: string;

  @column()
  public presentacion: string;

  @column()
  public cantidad_minima: number;

  @column()
  public descuento_porcentaje: number;

  @column()
  public precio: number;

  @column()
  public codigo: string;

  @column()
  public en_papelera: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_laboratorio: number;

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

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
    localKey: "id_laboratorio",
  })
  public laboratorio: HasOne<typeof Laboratorio>;

  @hasManyThrough([() => Institucion, () => TransferProductoInstitucion], {
    localKey: "id",
    foreignKey: "id_transfer_producto",
    throughLocalKey: "id_institucion",
    throughForeignKey: "id",
  })
  public instituciones: HasManyThrough<typeof Institucion>;

  @hasOne(() => Producto, {
    localKey: "codigo",
    foreignKey: "cod_barras",
  })
  public producto: HasOne<typeof Producto>;

  @hasManyThrough([() => Producto, () => Barextra], {
    localKey: "codigo",
    foreignKey: "cod_barras",
    throughLocalKey: "nro_registro_prod",
    throughForeignKey: "nro_registro",
  })
  public barextra_producto: HasManyThrough<typeof Producto>;

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
