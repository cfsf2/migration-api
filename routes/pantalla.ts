import Route from "@ioc:Adonis/Core/Route";

Route.post("config/:pantalla", "ConfigsController.Config");

Route.post("pantalla/:pantalla", "ConfigsController.ConfigPantalla");

Route.put("config/:config", "ConfigsController.ABM_put");

Route.post("guardar", "ConfigsController.Update");

Route.post("insertar", "ConfigsController.Insert");

Route.post("eliminar", "ConfigsController.Delete");

Route.post("menu", "ConfigsController.Menu");

Route.post("excel", "ConfigsController.Excel");
