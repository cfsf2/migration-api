declare module "@ioc:Adonis/Core/HttpContext" {
  interface HttpContextContract {
    $_filtros: {
      solicitados: {};
      filtrosObligatorios: string[];
    };
    $_sql: { sql: string; conf: string }[];
  }
}
