import Route from "@ioc:Adonis/Core/Route";

Route.get("/pedidos/:usuarioNombre", "PedidoController.mig_usuario");
Route.get("/pedidos", "PedidoController.mig_admin_pedidos").as("admin.pedidos");
Route.get(
  "pedidos/farmacias/:idFarmacia",
  "PedidoController.mig_farmacia_pedidos"
).as("farm.pedidos");

Route.get("/pedidos/pedido/:idPedido", "PedidoController.mig_pedido");

Route.post("/pedidos", `PedidoController.mig_confirmarPedido`);
Route.post("/pedidos/email", "FarmaciasController.mig_mail");

Route.put("/pedidos", "PedidoController.mig_update_pedido");
