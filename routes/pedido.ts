import Route from "@ioc:Adonis/Core/Route";

Route.get("/pedidos/:usuarioNombre", "PedidoController.mig_usuario");
Route.post("/pedidos", `PedidoController.mig_confirmarPedido`);

Route.post("/pedidos/email", "FarmaciasController.mig_mail");
