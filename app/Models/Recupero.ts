import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  HasManyThrough,
  hasManyThrough,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Monodro from "./Monodro";
import Estadio from "./Estadio";
import RecuperoEstadio from "./RecuperoEstadio";
import LineaTratamiento from "./LineaTratamiento";
import RecuperoLineaTratamiento from "./RecuperoLineaTratamiento";
import PerformanceStatus from "./PerformanceStatus";
import RecuperoPerformanceStatus from "./RecuperoPerformanceStatus";
import Diagnostico from "./Diagnostico";
import RecuperoDiagnostico from "./RecuperoDiagnostico";
import Usuario from "./Usuario";

export default class Recupero extends BaseModel {
  public static table = "tbl_recupero";

  @column({ isPrimary: true })
  public id_recupero: number;

  @column()
  public id_monodroga: number;

  @column()
  public nombre: string;

  @column()
  public fundamentos_tecnicos: string;

  @column()
  public porcentaje_recupero: number;

  @column()
  public habilitado: string;

  @column()
  public estadio_definido: string;

  @column()
  public performance_status_definido: string;

  @column()
  public linea_tratamiento_definido: string;

  @column()
  public en_combinacion_definido: string;

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

  @hasOne(() => Monodro, {
    foreignKey: "id",
    localKey: "id_monodroga",
  })
  public monodroga: HasOne<typeof Monodro>;

  @hasManyThrough([() => Estadio, () => RecuperoEstadio], {
    localKey: "id",
    foreignKey: "id_recupero",
    throughLocalKey: "id_estadio",
    throughForeignKey: "id",
  })
  public estadios: HasManyThrough<typeof Estadio>;

  @hasManyThrough([() => LineaTratamiento, () => RecuperoLineaTratamiento], {
    localKey: "id",
    foreignKey: "id_recupero",
    throughLocalKey: "id_linea_tratamiento",
    throughForeignKey: "id",
  })
  public lineatratamientos: HasManyThrough<typeof LineaTratamiento>;

  @hasManyThrough([() => PerformanceStatus, () => RecuperoPerformanceStatus], {
    localKey: "id",
    foreignKey: "id_recupero",
    throughLocalKey: "id_performance_status",
    throughForeignKey: "id",
  })
  public performance_status: HasManyThrough<typeof PerformanceStatus>;

  @hasManyThrough([() => Diagnostico, () => RecuperoDiagnostico], {
    localKey: "id",
    foreignKey: "id_recupero",
    throughLocalKey: "id_performance_status",
    throughForeignKey: "id",
  })
  public diagnosticos: HasManyThrough<typeof Diagnostico>;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      extras[k] = this.$extras[k];
    });
    extras["id"] = this.$primaryKeyValue;
    return extras;
  }
}
