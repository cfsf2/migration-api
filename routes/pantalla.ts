import Route from "@ioc:Adonis/Core/Route";

Route.post("config/", "ConfigsController.Config");

Route.post("pantalla/:pantalla", "ConfigsController.ConfigPantalla");
