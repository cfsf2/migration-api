import Route from "@ioc:Adonis/Core/Route";

Route.get("/instituciones", "InstitucionesController.mig_instituciones");
Route.get("/instituciones/search", "InstitucionesController.mig_instituciones");
