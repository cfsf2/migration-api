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
      const clearanceLevel = conf.permiso;
      if (!clearanceLevel) {
        console.log(usuario.id, " sin clearance para ", conf.id_a);
        return false;
      }
      switch (clearanceLevel) {
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
          const permisosUsuario = await arrayPermisos(usuario);

          if (
            permisosUsuario.findIndex((p: { nombre: string }) => {
              return p.nombre === conf.conf_permiso.permiso.nombre;
            }) !== -1
          ) {
            usuario.configuracionesPermitidas =
              usuario.configuracionesPermitidas.concat(`,"${conf.id_a}"`);
            return true;
          }

          return false;
        default:
          return false;
      }
    },
    { allowGuest: true }
  );

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
