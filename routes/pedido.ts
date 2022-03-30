import Route from "@ioc:Adonis/Core/Route";

Route.get("/pedidos/:usuarioNombre", "PedidoController.mig_usuario");

Route.post("/pedidos/email", 'FarmaciasController.mig_mail' );
