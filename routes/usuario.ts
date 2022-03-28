import Route from "@ioc:Adonis/Core/Route";

Route.get("/usuarios", "UsuariosController.index");
Route.get("/usuario-pass", "UsuariosController.pass");
Route.post("/users/loginwp", "AuthController.mig_loginwp");
