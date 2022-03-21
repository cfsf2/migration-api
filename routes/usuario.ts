import Route from "@ioc:Adonis/Core/Route";

Route.get("/usuarios", "UsuariosController.index");
Route.get("/usuario-pass", "UsuariosController.pass");
