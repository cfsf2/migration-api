import Route from "@ioc:Adonis/Core/Route";

Route.get("/productospack", "ProductoPackController.mig_index");
Route.get(
  "/productospack/entidad/:entidad",
  "ProductoPackController.mig_entidad"
);
