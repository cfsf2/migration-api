/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Bouncer from "@ioc:Adonis/Addons/Bouncer";
import { Permiso } from "App/Helper/permisos";
import Farmacia from "App/Models/Farmacia";
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
  .define("esAdmin", async (_usuario: Usuario, us: Usuario) => {
    if (!!(us.$preloaded.perfil as any).find((p) => p.id === 1)) {
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
