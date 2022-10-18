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
import { DateTime } from "luxon";
import Permiso from "./Permiso";
import SComponente from "./SComponente";
import SConfCpsc from "./SConfCpsc";
import SConfPermiso from "./SConfPermiso";
import SConfTipoAtributoValor from "./SConfTipoAtributoValor";
import STipo from "./STipo";
import Usuario from "./Usuario";

export default class SConf extends BaseModel {
  static toJSON() {
    throw new Error("Method not implemented.");
  }
  static getAtributo(arg0: { atributo: string }) {
    throw new Error("Method not implemented.");
  }
  public static table = "s_conf";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public permiso: string;

  @column()
  public id_a: string;

  @column({ serializeAs: null })
  public id_tipo: number;

  @column()
  public id_componente: number | null;

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
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  @belongsTo(() => SConfPermiso, {
    localKey: "id_conf",
    foreignKey: "id",
  })
  public conf_permiso: BelongsTo<typeof SConfPermiso>;

  @hasOne(() => STipo, {
    localKey: "id_tipo",
    foreignKey: "id",
  })
  public tipo: HasOne<typeof STipo>;

  @belongsTo(() => SComponente, {
    localKey: "id",
    foreignKey: "id_componente",
  })
  public componente: BelongsTo<typeof SComponente>;

  @hasManyThrough([() => Permiso, () => SConfPermiso], {
    localKey: "id",
    foreignKey: "id_conf",
    throughLocalKey: "id_permiso",
    throughForeignKey: "id",
  })
  public permiso_string: HasManyThrough<typeof Permiso>;

  @hasMany(() => SConfCpsc, {
    localKey: "id",
    foreignKey: "id_conf",
  })
  public orden: HasMany<typeof SConfCpsc>;

  @hasMany(() => SConfTipoAtributoValor, {
    localKey: "id",
    foreignKey: "id_conf",
  })
  public valores: HasMany<typeof SConfTipoAtributoValor>;

  @hasManyThrough([() => SConf, () => SConfCpsc], {
    localKey: "id",
    foreignKey: "id_conf",
    throughLocalKey: "id_conf_h",
    throughForeignKey: "id",
  })
  public sub_conf: HasManyThrough<typeof SConf>;
  static id_a: any;
  static id: any;
  static orden: any;
  static valores: any;
  static sub_conf: typeof SConf[];
  static tipo: any;

  public getAtributo({ atributo }: { atributo: string }): string {
    if (!this.valores) {
      console.log(
        "Configuracion no tiene valores?? No, te olvidaste los preload"
      );
      return "";
    }

    return this.valores.find((v) => {
      return v.atributo[0].nombre === atributo;
    })?.valor as string;
  }

  private static preloadRecursivo(query) {
    return query
      .preload("conf_permiso", (query) => query.preload("permiso"))
      .preload("tipo")
      .preload("orden")
      .preload("valores", (query) => query.preload("atributo"))
      .preload("sub_conf", (query) => this.preloadRecursivo(query));
  }

  public static async findByIda({ id_a }: { id_a: string }) {
    try {
      const res = (
        await this.query()
          .where("id_a", id_a)
          .preload("conf_permiso", (query) => query.preload("permiso"))
          .preload("tipo")
          // .preload("componente")
          .preload("orden")
          .preload("valores", (query) => query.preload("atributo"))
          .preload("sub_conf", (query) => this.preloadRecursivo(query))
      ).pop();

      return res;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

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
