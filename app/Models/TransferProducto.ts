import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Laboratorio from "./Laboratorio";
import Database from "@ioc:Adonis/Lucid/Database";
import TransferProductoInstitucion from "./TransferProductoInstitucion";
import { eliminarKeysVacios, enumaBool } from "App/Helper/funciones";

export default class TransferProducto extends BaseModel {
  static async traerTrasferProducto({
    en_papelera,
    habilitado,
  }: {
    en_papelera?: string;
    habilitado?: string;
  }) {
    const trasfersProducto = await Database.from("tbl_transfer_producto as tp")
      .select(
        "tp.*",
        "tp.id as _id",
        "tp.id as id",
        "tp.habilitado as habilitado",
        "tp.nombre as nombre",
        "tp.codigo as codigo",
        "tp.ts_creacion as fechaalta",
        "tp.ts_creacion as fecha_alta",
        "tp.ts_modificacion as fecha_modificacion",
        "l.id as laboratorioid",
        "u.id_usuario_creacion as id_usuario_alta",
        "u.id_usuario_modificacion as id_usuario_modificacion"
      )
      .leftJoin("tbl_laboratorio as l", "tp.id_laboratorio", "l.id")
      .leftJoin("tbl_usuario as u", "tp.id", "u.id")
      //en_papelera
      .if(en_papelera, (query) => {
        query.where("tp.en_papelera", "n");
      })
      .if(habilitado, (query) => {
        query.where("tp.habilitado", "s");
      })
      .orderBy("codigo", "desc");

    return trasfersProducto.map((t) => {
      t._id = t._id.toString();
      return enumaBool(t);
    });
  }

  static async agregar(data) {
    const nuevoPF = new TransferProducto();

    const instituciones = data.instituciones;

    delete data.instituciones;

    try {
      nuevoPF.merge({
        id_laboratorio: data.laboratorioid,
        nombre: data.nombre,
        habilitado: data.habilitado ? "s" : "n",
        presentacion: data.presentacion,
        cantidad_minima: data.cantidad_minima,
        descuento_porcentaje: data.descuento_porcentaje,
        precio: data.precio,
        codigo: data.codigo,
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
      return;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  static async actualizar(id, data) {
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
      cantidad_minima: data.productosTransfers.cantidad_minima,
      descuento_porcentaje: data.productosTransfers.descuento_porcentaje,
      precio: data.productosTransfers.precio,
      codigo: data.productosTransfers.codigo,
      en_papelera:
        typeof data.productosTransfers.en_papelera !== "undefined"
          ? data.productosTransfers.en_papelera
            ? "s"
            : "n"
          : null,
    };

    transferProducto.merge(eliminarKeysVacios(mergeObject));
    try {
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
      console.log(err);
      return err;
    }
  }
  public static table = "tbl_transfer_producto";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

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
}
