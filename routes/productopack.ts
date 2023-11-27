import Route from "@ioc:Adonis/Core/Route";

Route.get("/productospack", "ProductoPackController.mig_index");
Route.get(
  "/productospack/entidad/:entidad",
  "ProductoPackController.mig_entidad"
);
Route.get("/productospack/all/",
"ProductoPackController.mig_producto")

Route.get(
   "/productospack/:idProducto",
   "ProductoPackController.producto"
 ).where("idProducto", {
     match: /^[0-9]+$/,
     cast: (id) => Number(id),
 });

Route.get("/productospack/papelera/", "ProductoPackController.mig_papelera");

Route.post("/productospack", "ProductoPackController.mig_agregar_producto");

Route.put("/productospack", "ProductoPackController.mig_update_producto");

Route.delete(
  "/productospack/:id",
  "ProductoPackController.mig_delete_producto"
);
