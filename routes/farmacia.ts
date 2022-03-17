import Route from "@ioc:Adonis/Core/Route";

Route.resource("/farmacia", "FarmaciasController.ts");

Route.get("/farmacia/usuario", "FarmaciasController.ts");
