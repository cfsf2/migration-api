import Route from "@ioc:Adonis/Core/Route";

Route.get("/publicidades", "PublicidadsController.mig_publicidades");
Route.get(
  "/farmacias/novedades/admin",
  "PublicidadsController.mig_novedadesAdmin"
);
Route.get(
  "/farmacias/novedades/search",
  "PublicidadsController.mig_novedadesSearch"
);
