import Route from "@ioc:Adonis/Core/Route";

Route.get("pantalla/", "ConfigsController.Config");

Route.post("pantalla/:pantalla", "ConfigsController.ConfigPantalla");
