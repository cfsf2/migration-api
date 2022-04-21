import Route from "@ioc:Adonis/Core/Route";

Route.get("/categorias", "CategoriaController.index");
Route.get("/categorias/admin", "CategoriaController.mig_admin");

Route.post("/categorias", "CategoriaController.mig_agregar_categoria");
