import { DateTime } from "luxon";
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  hasMany,
  HasMany,
  HasManyThrough,
  hasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Database from "@ioc:Adonis/Lucid/Database";
import { enumaBool } from "App/Helper/funciones";
import LaboratorioDrogueria from "./LaboratorioDrogueria";
import Drogueria from "./Drogueria";
import Apm from "./Apm";
import LaboratorioModalidadEntrega from "./LaboratorioModalidadEntrega";
import LaboratorioTipoComunicacion from "./LaboratorioTipoComunicacion";
import TipoInformeTransfer from "./TipoInformeTransfer";
import TransferCategoria from "./TransferCategoria";

export default class Laboratorio extends BaseModel {
  static async traerLaboratorios({ id }: { id?: number }) {
    const laboratorios = await Database.from("tbl_laboratorio as l")
      .select("*", "l.id as _id", "l.id as id", "l.ts_creacion as fechaalta")
      .if(id, (query) => query.where("id", id as number))
      .orderBy("fechaalta", "desc");

    let result = laboratorios.map((l) => {
      l._id = l._id.toString();
      enumaBool(l);
      return l;
    });

    if (result.length === 1) return result[0];
    return result;
  }

  public static table = "tbl_laboratorio";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public habilitado: string;

  @column()
  public imagen: string;

  @column()
  public novedades: string;

  @column()
  public condiciones_comerciales: string;

  @column()
  public transfer_farmageo: string;

  @column()
  public url: string;

  @column()
  public email: string;

  @column()
  public usa_sistema: string;

  @column()
  public tiene_apms: string;

  @column()
  public monto_minimo_transfer: number;

  @column()
  public unidades_minimas_transfer: number;

  @column()
  public envia_email_transfer_auto: string;

  @column()
  public calcular_precio: string;
  
  @column()
  public calcular_porcentaje_descuento: string;

  @column()
  public id_usuario: number;

  @column()
  public id_tipo_informe_transfer: number;

  @hasOne(() => TipoInformeTransfer, {
    foreignKey: "id",
    localKey: "id_tipo_informe_transfer",
  })
  public tipo_informe_transfer: HasOne<typeof TipoInformeTransfer>;

  @column()
  public id_transfer_categoria: number;

  @belongsTo(() => TransferCategoria, {
    foreignKey: "id_transfer_categoria",
    localKey: "id",
  })
  public transfer_categoria: BelongsTo<typeof TransferCategoria>;

  @column()
  public id_tipo_comunicacion: number;

  @column()
  public id_modalidad_entrega: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

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

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario",
  })
  public usuario: HasOne<typeof Usuario>;

  @hasOne(() => LaboratorioModalidadEntrega, {
    foreignKey: "id",
    localKey: "id_modalidad_entrega",
  })
  public modalidad_entrega: HasOne<typeof LaboratorioModalidadEntrega>;

  @hasOne(() => LaboratorioTipoComunicacion, {
    foreignKey: "id",
    localKey: "id_tipo_comunicacion",
  })
  public tipo_comunicacion: HasOne<typeof LaboratorioTipoComunicacion>;

  @hasManyThrough([() => Drogueria, () => LaboratorioDrogueria], {
    localKey: "id",
    foreignKey: "id_laboratorio",
    throughLocalKey: "id_drogueria",
    throughForeignKey: "id",
  })
  public droguerias: HasManyThrough<typeof Drogueria>;

  @hasMany(() => Apm, {
    localKey: "id",
    foreignKey: "id_laboratorio",
  })
  public apms: HasMany<typeof Apm>;

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
