import Route from "@ioc:Adonis/Core/Route";

Route.post("config/", "ConfigsController.Config");

Route.post("pantalla/:pantalla", "ConfigsController.ConfigPantalla");

Route.post("guardar", "ConfigsController.Update");

Route.post("insertar", "ConfigsController.Insert");

Route.post("eliminar", "ConfigsController.Delete");

Route.get("test", "ConfigsController.Test");
