import Route from "@ioc:Adonis/Core/Route";

Route.get("/productosTransfers", "ProductosTransfersController.mig_index");
Route.get(
  "/productosTransfers/instituciones/:id",
  "ProductosTransfersController.mig_instituciones"
);

Route.post("/productosTransfers", "ProductosTransfersController.mig_add");

Route.put("/productosTransfers", "ProductosTransfersController.mig_actualizar");

Route.delete(
  "/productosTransfers/:id",
  "ProductosTransfersController.mig_delete"
);
