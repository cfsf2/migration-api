import Route from "@ioc:Adonis/Core/Route";

Route.get("/users", "UsuariosController.index");
Route.get("/usuario-pass", "UsuariosController.pass");
Route.get("/users/logout", "AuthController.logout");

Route.get("/users/:usuarioNombre", "UsuariosController.mig_perfilUsuario");

Route.post("/usuario_invitado/", "UsuariosController.usuario_invitado");
Route.post("/usuario_invitado/add", "UsuariosController.usuario_invitado_add");
Route.post(
  "/usuario_invitado/delete",
  "UsuariosController.usuario_invitado_delete"
);
Route.post("/usuario_invitado/evento", "UsuariosController.evento");

Route.post("/users/loginwp", "AuthController.mig_loginwp");
Route.get("/permisos/perfiles", "AuthController.mig_perfiles");

Route.post("/users/alta-usuario-web", "UsuariosController.mig_alta_usuarioWeb");
Route.post("/users/alta-usuario", "UsuariosController.mig_alta_usuario");
Route.post(
  "/users/alta-usuario-farmacia",
  "UsuariosController.mig_alta_usuarioFarmacia"
);

Route.post("/checkToken", "AuthController.checkToken");

Route.put(
  "/users/updateWebUser",
  "UsuariosController.mig_actualizar_usuarioWeb"
);
Route.put("/users/", "UsuariosController.mig_actualizar");
Route.put("/users/newpassword", "UsuariosController.mig_newpassword");

Route.delete("/users", "UsuariosController.delete");
