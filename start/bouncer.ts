/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from "@ioc:Adonis/Addons/Bouncer";
import { Permiso, acciones } from "App/Helper/permisos";
import Farmacia from "App/Models/Farmacia";
import SConf from "App/Models/SConf";
import Usuario from "App/Models/Usuario";
import { arrayPermisos } from "App/Helper/funciones";
import MenuItem from "App/Models/MenuItem";

/*
|--------------------------------------------------------------------------
| Bouncer Actions
|--------------------------------------------------------------------------
|
| Actions allows you to separate your application business logic from the
| authorization logic. Feel free to make use of policies when you find
| yourself creating too many actions
|
| You can define an action using the `.define` method on the Bouncer object
| as shown in the following example
|
| ```
| 	Bouncer.define('deletePost', (user: User, post: Post) => {
|			return post.user_id === user.id
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "actions" const from this file
|****************************************************************
*/

export const { actions } = Bouncer.define(
  "actualizarUsuarioWeb",
  (usuario: Usuario, idUsuarioActualizar: number) => {
    return idUsuarioActualizar === usuario.id;
  }
)
  .define("adminOfarmacia", async (usuario: Usuario, farmacia: Farmacia) => {
    await usuario.load("perfil", (q) => q.preload("permisos"));

    if (usuario.perfil.find((p) => p.id === 1)) return true;
    if (farmacia.id_usuario === usuario.id) return true;
    return false;
  })
  .define(
    "AccesoRuta",
    async (usuario: Usuario, permiso: Permiso | Permiso[]) => {
      const permisos = await arrayPermisos(usuario);

      if (Array.isArray(permiso)) {
        if (
          permisos.some((p: { nombre: string }) =>
            permiso.includes(p.nombre as Permiso)
          )
        )
          return true;
        return false;
      }

      if (
        permisos.findIndex((p: { nombre: string }) => p.nombre === permiso) !==
        -1
      )
        return true;

      return Bouncer.deny("Acceso no autorizado", 401);
    }
  )
  .define("esAdmin", async (_usuario: Usuario, us: Usuario) => {
    if (!!(us.$preloaded.perfil as any).find((p) => p.tipo === "admin")) {
      return us.habilitado === "s";
    }
    const tienePerfilFarmacia = await Farmacia.findBy("id_usuario", us.id);

    if (tienePerfilFarmacia) {
      return tienePerfilFarmacia.habilitado === "s" && us.habilitado === "s";
    }
    if (us.esfarmacia === "n" && us.admin === "n") {
      console.log("Hola soy un cliente web");
      return true;
    }
    return false;
  })
  .define(
    "AccesoConf",
    async (usuario: Usuario, conf: SConf, accion?: acciones) => {
      accion;

      conf = await SConf.findOrFail(conf.id);
      await conf.load("conf_permiso", (c) => c.preload("permiso"));

      const tienePermiso = async (conf) => {
        await conf.load("permiso_string");
        const permisosUsuario = (await arrayPermisos(usuario)).map(
          (u) => u.nombre
        );
        const confPermisos = conf.permiso_string.map((p) => {
          return { nombre: p.nombre, id: p.id };
        });

        switch (conf.permiso) {
          case undefined:
            return false;
          case "t":
            if (usuario) {
              usuario.configuracionesPermitidas =
                usuario.configuracionesPermitidas.concat(`,"${conf.id_a}"`);
            }
            return true;
          case "u":
            if (usuario) {
              usuario.configuracionesPermitidas =
                usuario.configuracionesPermitidas.concat(`,"${conf.id_a}"`);
              return true;
            }
            return false;
          case "n":
            return false;
          case "p":
            if (confPermisos.length === 0) {
              throw {
                code: "conf_permiso_null",
                mensaje: `Configuracion no tiene permisos pero conf.permiso = p. ${conf.id_a}`,
              };
            }
            if (
              confPermisos.some((item) => permisosUsuario.includes(item.nombre))
            ) {
              usuario.configuracionesPermitidas =
                usuario.configuracionesPermitidas.concat(`,"${conf.id_a}"`);
              return true;
            }

            return false;
          case "sp":
            if (
              confPermisos.some((item) => permisosUsuario.includes(item.nombre))
            ) {
              return false;
            }
            usuario.configuracionesPermitidas =
              usuario.configuracionesPermitidas.concat(`,"${conf.id_a}"`);

            return true;
          default:
            return false;
        }
      };

      return tienePermiso(conf);
    },
    { allowGuest: true }
  )
  .define("AccesoMenu", async (usuario: Usuario, menu: MenuItem) => {
    const permisosUsuario = await arrayPermisos(usuario);
    const M = await MenuItem.query()
      .where("id", menu.id)
      .preload("permisos")
      .firstOrFail();
    if (!M.permisos || M.permisos.length === 0) return false;
    // Verificar que el usuario tenga al menos uno de los permisos del menú
    const tieneAlMenosUnPermiso = M.permisos.some((permiso) =>
      permisosUsuario.some((p) => p.id === permiso.id)
    );

    return tieneAlMenosUnPermiso;
  });

/*
|--------------------------------------------------------------------------
| Bouncer Policies
|--------------------------------------------------------------------------
|
| Policies are self contained actions for a given resource. For example: You
| can create a policy for a "User" resource, one policy for a "Post" resource
| and so on.
|
| The "registerPolicies" accepts a unique policy name and a function to lazy
| import the policy
|
| ```
| 	Bouncer.registerPolicies({
|			UserPolicy: () => import('App/Policies/User'),
| 		PostPolicy: () => import('App/Policies/Post')
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "policies" const from this file
|****************************************************************
*/
export const { policies } = Bouncer.registerPolicies({});
