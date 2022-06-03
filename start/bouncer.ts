/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from "@ioc:Adonis/Addons/Bouncer";
import { Permiso } from "App/Helper/permisos";
import SConf from "App/Models/SConf";
import Usuario from "App/Models/Usuario";

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
  .define(
    "AccesoRuta",
    async (usuario: Usuario, permiso: Permiso | Permiso[]) => {
      const perfiles = await usuario
        .related("perfil")
        .query()
        .preload("permisos");

      let permisos: any = [];

      perfiles.forEach((perfil) => {
        perfil.permisos.forEach((permiso) => permisos.push(permiso));
      });

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
  .define(
    "AccesoConf",
    async (usuario: Usuario, conf: SConf) => {
      const clearanceLevel = conf.permiso;
      if (!clearanceLevel) {
        console.log("sin clearance");
        return false;
      }
      switch (clearanceLevel) {
        case undefined:
          // console.log("undefined", clearanceLevel, conf.permiso, conf.id_a);
          return false;
        case "t":
          //  console.log("todos", clearanceLevel, conf.permiso, conf.id_a);
          return true;
        case "u":
          // console.log(
          //   "usuario logueado",
          //   clearanceLevel,
          //   conf.permiso,
          //   conf.id_a,
          //   usuario
          // );
          if (usuario) return true;

          return false;
        case "n":
          //console.log("nadie", clearanceLevel, conf.permiso, conf.id_a);
          return false;
        case "p":
          // console.log(
          //   "Con Permiso",
          //   clearanceLevel,
          //   conf.id_a,
          //   conf.conf_permiso.permiso.nombre
          // );
          const perfiles = await usuario
            .related("perfil")
            .query()
            .preload("permisos");

          let permisosUsuario: any = [];

          perfiles.forEach((perfil) => {
            perfil.permisos.forEach((permiso) => permisosUsuario.push(permiso));
          });

          if (Array.isArray(conf.permiso)) {
            // if (
            //   permisos.some((p: { nombre: string }) =>
            //     conf.conf_permiso.permiso.includes(p.nombre as Permiso)
            //   )
            // )
            return true;
            return false;
          }

          if (
            permisosUsuario.findIndex(
              (p: { nombre: string }) =>
                p.nombre === conf.conf_permiso.permiso.nombre
            ) !== -1
          )
            return true;

          return Bouncer.deny("Acceso no autorizado", 401);
        default:
          // console.log("default", clearanceLevel, conf.permiso, conf.id_a);
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
