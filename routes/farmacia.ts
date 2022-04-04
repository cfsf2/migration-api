import Route from "@ioc:Adonis/Core/Route";

Route.get("/farmacias", "FarmaciasController.ts.mig_index");
Route.get("/farmacias/:usuario", "FarmaciasController.ts.mig_perfil");
Route.get("/farmacias/login/:usuario", "FarmaciasController.ts.mig_perfil");
//Route.get("farmacias/login/:usuario", "FarmaciasController.ts.mig_perfil");
