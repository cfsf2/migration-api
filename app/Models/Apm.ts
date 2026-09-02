import { column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Laboratorio from "./Laboratorio";
import Base from "./Base";
import ExceptionHandler from "App/Exceptions/Handler";

export default class Apm extends Base {
  public static table = "tbl_apm";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public email: string;

  @column()
  public usa_sistema: string;

  @column()
  public habilitado: string;

  @column()
  public administrador: string;

  @column()
  public id_laboratorio: number;

  public static async hacerAdministrador({ ctx, usuario, id, valor, conf }) {
    usuario;
    conf;

    try {
      const Apm_ = await Apm.findOrFail(id);

      if (valor === "n") {
        const ampAdministrador = await Apm.query()
          .where("id_laboratorio", Apm_.id_laboratorio)
          .where("administrador", "s")
          .andWhereNot("id", Apm_.id);

        if (ampAdministrador.length > 0) {
          return Apm_.merge({
            administrador: "n",
          }).save();
        }
        if (ampAdministrador.length === 0) {
          return new ExceptionHandler().handle(
            {
              code: "NO_HAY_OTRO_APM_ADMINISTRADOR",
              message: "No hay otro apm Administrador.",
            },
            ctx
          );
        }
      }

      const apms = await Apm.query()
        .where("id_laboratorio", Apm_.id_laboratorio)
        .andWhereNot("id", Apm_.id);

      Promise.all(
        apms.map(async (a) => {
          await a.merge({ administrador: "n" }).save();
        })
      );

      await Apm_.merge({
        administrador: "s",
      }).save();

      return { registroModificado: Apm_, modificado: true };
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
    localKey: "id_laboratorio",
  })
  public laboratorio: HasOne<typeof Laboratorio>;

  @column()
  public id_usuario: number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario",
  })
  public usuario: HasOne<typeof Usuario>;
}
