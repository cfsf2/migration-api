import { DateTime } from "luxon";
import { schema, rules, validator } from "@ioc:Adonis/Core/Validator";
import {
  afterCreate,
  BaseModel,
  beforeCreate,
  beforeSave,
  column,
  HasMany,
  hasMany,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Localidad from "./Localidad";
import CampanaRequerimiento from "./CampanaRequerimiento";
import Hash from "@ioc:Adonis/Core/Hash";

export default class Usuario extends BaseModel {
  public static table = "tbl_usuario";

  public static async registrarUsuarioWeb(usuario: {
    usuario: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: number;
    celular: string;
  }) {
    const usuarioSchema = schema.create({
      usuario: schema.string({ trim: true }, [
        rules.unique({
          table: "tbl_usuario",
          column: "usuario",
          caseInsensitive: true,
        }),
      ]),
      nombre: schema.string(),
      apellido: schema.string(),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({ table: "tbl_usuario", column: "email" }),
      ]),
      telefono: schema.string({}, [rules.mobile({ locales: ["es-AR"] })]),
      password: schema.string(),
      habilitado: schema.string.optional(),
      dni: schema.number.optional(),
      id_localidad: schema.string.optional(),
      esfarmacia: schema.string.optional(),
      admin: schema.string.optional(),
      demolab: schema.string.optional(),
      id_usuario_creacion: schema.number.optional(),
      id_usuario_modificacion: schema.number.optional(),
      f_ultimo_acceso: schema.string.optional(),
    });
    try {
      const data = await validator.validate({
        schema: usuarioSchema,
        data: usuario,
      });

      data.admin = "n";
      data.esfarmacia = "n";
      data.demolab = "n";
      data.f_ultimo_acceso = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

      const nuevoUsuario = new Usuario();
      await nuevoUsuario.fill(data).save();
    } catch (err) {
      console.log(err);
    }
  }

  @column({ isPrimary: true })
  public id: number;

  @column()
  public usuario: string;

  @column()
  public nombre: string;

  @column()
  public apellido: string;

  @column()
  public dni: number;

  @column()
  public fecha_nac?: Date;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public newsletter: string;

  @column()
  public habilitado: string;

  @column()
  public esfarmacia: string;

  @column()
  public admin: string;

  @column()
  public confirmado: string;

  @column()
  public telefono: string;

  @column()
  public f_ultimo_acceso: string;

  @column()
  public deleted: string;

  @column()
  public demolab: string;

  @column()
  public id_wp: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public celular: string;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Localidad, {
    foreignKey: "id",
  })
  public id_localidad: HasOne<typeof Localidad>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasMany(() => CampanaRequerimiento, {
    foreignKey: "id_usuario",
  })
  public requerimientos: HasMany<typeof CampanaRequerimiento>;

  @beforeCreate()
  public static async hashPassword(user: Usuario) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  // Campos locos especificamente diseñados para que siga funcionando la aplicacion sin cambiar el frontend
  public give_user_display_name() {
    return this.nombre + " " + this.apellido;
  }
  @column()
  public user_display_name: string;

  @column()
  public user_email: string;

  @column()
  public token: string;
}
