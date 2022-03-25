import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Usuario from "./Usuario";
import EstadoPedido from "./EstadoPedido";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Pedido extends BaseModel {
  static async traerPedidos() {
    const datos = await Database.from("tbl_pedido").select("*");

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
    return arrNuevo;
  }
  public static table = "tbl_pedido";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public descripcion: string;

  @column()
  public comentario: string;

  @column()
  public costoenvio: string;

  @column()
  public domicilioenvio: string;

  @column()
  public gruposproductos: string;

  @column()
  public pago_online: string;

  @column()
  public envio: string;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public fechaentrega: DateTime;

  @column()
  public es_invitado: string;

  @column()
  public id_socio: string;

  @column()
  public datos_cliente: string;

  @column()
  public origen: string;

  @column()
  public username: string;

  @column()
  public nombrefarmacia: string;

  @column()
  public whatsapp: string;

  @column()
  public obra_social: string;

  @column()
  public obra_social_frente: string;

  @column()
  public obra_social_dorso: string;

  @column()
  public receta: string;

  @column()
  public total: number;

  @column()
  public id_usuario_creacion: Number;

  @column()
  public id_usuario_modificacion: Number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_farmacia: Number;

  @column()
  public id_estado_pedido: Number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key

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

  @hasOne(() => Farmacia, {
    foreignKey: "id",
    localKey: "id_farmacia",
  })
  public farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => EstadoPedido, {
    foreignKey: "id",
    localKey: "id_estado_pedido",
  })
  public estado_pedido: HasOne<typeof EstadoPedido>;
}
