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
  HasManyThrough,
  hasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Localidad from "./Localidad";
import CampanaRequerimiento from "./CampanaRequerimiento";
import Hash from "@ioc:Adonis/Core/Hash";
import Database from "@ioc:Adonis/Lucid/Database";
import { ResponseContract } from "@ioc:Adonis/Core/Response";
import { RequestContract } from "@ioc:Adonis/Core/Request";
import Perfil from "./Perfil";
import UsuarioPerfil from "./UsuarioPerfil";
import { eliminarKeysVacios, enumaBool } from "App/Helper/funciones";

export default class Usuario extends BaseModel {
  public static table = "tbl_usuario";

  static async traerPerfilDeUsuario({
    usuarioNombre,
  }: {
    usuarioNombre?: string;
  }) {
    if (usuarioNombre === "No%20Registrado") return;

    let usuarios = await Database.from("tbl_usuario")
      .select(
        Database.raw(
          `tbl_usuario.*, 
          tbl_usuario.nombre as name, 
          tbl_usuario.fecha_nac as fechaNac, 
          tbl_usuario.telefono as telephone, 
          tbl_usuario.f_ultimo_acceso as ultimoacceso, 
          tbl_usuario.ts_creacion as fecha_alta, 
          tbl_usuario.ts_modificacion as fecha_modificacion,
          tbl_localidad.nombre as localidad,
          tbl_usuario_perfil.id_perfil as perfil,
          tbl_usuario.id as _id,
          tbl_usuario.id
          `
        )
      )
      .leftJoin(`tbl_localidad`, `tbl_usuario.id_localidad`, `tbl_localidad.id`)
      .leftJoin(
        `tbl_usuario_perfil`,
        `tbl_usuario.id`,
        `tbl_usuario_perfil.id_usuario`
      )
      .if(usuarioNombre, (query) => {
        return query.where("usuario", usuarioNombre);
      });

    if (usuarios.length === 0) return "Usuario no encontrado";

    await Promise.all(
      usuarios.map(async (usuario) => {
        let permisos = await Database.from("tbl_perfil_permiso")
          .select(Database.raw(`tipo`))
          .leftJoin(
            `tbl_permiso`,
            `tbl_perfil_permiso.id_permiso`,
            `tbl_permiso.id`
          )
          .if(usuario, (query) => {
            return query.where("tbl_perfil_permiso.id_perfil", usuario.perfil);
          })
          .groupBy("tipo");

        let arrNuevo: string[] = [];
        permisos.forEach((i) => {
          arrNuevo.push(i.tipo);
          return arrNuevo;
        });

        usuario.permisos = arrNuevo;
      })
    );

    usuarios = usuarios.map((e) => {
      e._id = e._id.toString();
      enumaBool(e);

      return e;
    });

    if (usuarios.length === 1) {
      return usuarios[0];
    }
    return usuarios;
  }

  public static async registrarUsuarioWeb(
    usuario: {
      usuario: string;
      nombre: string;
      apellido: string;
      email: string;
      telefono: number;
      celular: string;
    },
    response: ResponseContract
  ) {
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
      celular: schema.string({}, [rules.mobile({ locales: ["es-AR"] })]),
      password: schema.string(),
      habilitado: schema.string.optional(),
      dni: schema.number.optional(),
      fecha_nac: schema.string.optional(),
      id_localidad: schema.number.optional(),
      esfarmacia: schema.string.optional(),
      admin: schema.string.optional(),
      demolab: schema.string.optional(),
      id_usuario_creacion: schema.number.optional(),
      id_usuario_modificacion: schema.number.optional(),
      f_ultimo_acceso: schema.string.optional(),
    });

    try {
      const usuarioValidado = await validator.validate({
        schema: usuarioSchema,
        data: usuario,
        messages: {
          "email.unique": "El email ya esta en uso",
          "email.required": "Un email es requerido",
        },
      });

      usuarioValidado.admin = "n";
      usuarioValidado.esfarmacia = "n";
      usuarioValidado.demolab = "n";
      usuarioValidado.f_ultimo_acceso = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

      const nuevoUsuario = new Usuario();
      const usuarioGuardado = await nuevoUsuario.fill(usuarioValidado).save();

      const usuarioRegistrado = await Usuario.query().where(
        "id",
        usuarioGuardado.$attributes.id
      );
      usuarioRegistrado[0].id_usuario_creacion = usuarioRegistrado[0].id;
      usuarioRegistrado[0].id_usuario_modificacion = usuarioRegistrado[0].id;
      await usuarioRegistrado[0].save();

      response.status(201);
      return usuarioRegistrado[0];
    } catch (err) {
      console.log(err);
      response.status(409);
      return "El email ya esta en uso";
    }
  }

  public static async actualizarTelefonoUsuarioWeb({
    id,
    usuarioData,
    response,
  }: {
    id: number;
    usuarioData: any;
    request: RequestContract;
    response: ResponseContract;
  }) {
    const usuario = await Usuario.find(id);

    try {
      if (usuario) {
        usuario.telefono = usuarioData.telephone;
        usuario.celular = usuarioData.telephone;
        usuario.save();
        return response.status(202);
      }
    } catch (err) {
      console.log(err);
      return response.status(409);
    }
  }

  public static async actualizar({
    id_usuario,
    data,
  }: {
    id_usuario: number;
    data: any;
  }) {
    const usuario = await Usuario.findOrFail(Number(id_usuario));
    const perfilUsuario = await UsuarioPerfil.findBy(
      "id_usuario",
      Number(id_usuario)
    );
    const localidad = await Localidad.findBy("nombre", data.localidad);

    //Localidad
    if (localidad && usuario.id_localidad !== localidad?.id) {
      data.id_localidad = localidad.id;
    }

    let mergObject: any = {
      nombre: data.nombre,
      usuario: data.usuario,
      apellido: data.apellido,
      dni: data.dni,
      fecha_nac: data.fecha_nac,
      id_localidad: data.id_localidad,
      email: data.email,

      newsletter: data.newsletter ? "s" : "n",
      habilitado: data.habilitado ? "s" : "n",
      esfarmacia: data.esfarmacia ? "s" : "n",
      admin: data.admin ? "s" : "n",
      confirmado: data.confirmado ? "s" : "n",
      telefono: data.telefono,

      deleted: data.deleted ? "s" : "n",
      demolab: data.demolab ? "s" : "n",
      id_wp: data.id_wp,
      celular: data.celular,
      telephone: data.telephone,
    };

    mergObject = eliminarKeysVacios(mergObject);

    usuario.merge(mergObject);
    usuario.save();
    if (data.perfil) {
      perfilUsuario?.merge({ id_perfil: Number(data.perfil) });
      perfilUsuario?.save();
    }
    return usuario;
  }

  public static async cambiarPasswordByUsername({ username, password }) {
    const usuario = await Usuario.findByOrFail("usuario", username);

    usuario.merge({ password: password });
    return usuario.save();
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
  public fecha_nac?: string;

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

  @column()
  public celular: string;

  @column()
  public id_localidad?: Number;

  @column()
  public permisos: string[];

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasManyThrough([() => Perfil, () => UsuarioPerfil], {
    localKey: "id",
    foreignKey: "id_usuario",
    throughLocalKey: "id_perfil",
    throughForeignKey: "id",
  })
  public perfil: HasManyThrough<typeof Perfil>;

  @hasOne(() => Localidad, {
    foreignKey: "id",
    localKey: "id_localidad",
  })
  public localidad: HasOne<typeof Localidad>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  @hasMany(() => CampanaRequerimiento, {
    foreignKey: "id_usuario",
    localKey: "id",
  })
  public requerimientos: HasMany<typeof CampanaRequerimiento>;

  @beforeCreate()
  public static async hashPassword(user: Usuario) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @beforeSave()
  public static async hashPasswordSave(user: Usuario) {
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

  @column()
  public user_rol: string[];

  public serializeExtras() {
    return {
      _id: this.$extras._id?.toString(),
    };
  }
}
