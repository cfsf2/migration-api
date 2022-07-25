declare module "@ioc:Adonis/Core/HttpContext" {
  interface HttpContextContract {
    $_filtros: {
      solicitados: {};
      filtrosObligatorios: string[];
    };
    $_sql: { sql: string; conf: string }[];
    $_datos: any[];
    $_errores: {
      error: { message: string; continuar?: boolean };
      conf: string;
    }[];
    $_respuesta: { configuraciones: any[]; opciones: {}; error: {} };
    $_conf: {
      estructura: any;
      buscarPadre: ({ id, conf }: { id: string; conf: any }) => {};
    };

    usuario: any;
  }
}
