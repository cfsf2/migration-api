import Route from "@ioc:Adonis/Core/Route";

Route.get("/pedidos/:usuarioNombre", "PedidoController.mig_usuario");
Route.get("/pedidos", "PedidoController.mig_admin_pedidos").as("admin.pedidos");

Route.post("/pedidos", `PedidoController.mig_confirmarPedido`);
Route.post("/pedidos/email", "FarmaciasController.mig_mail");
