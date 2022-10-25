import SConf from "App/Models/SConf";

declare module "@ioc:Adonis/Core/HttpContext" {
  interface HttpContextContract {
    $_filtros: {
      solicitados: {};
      filtrosObligatorios: string[];
    };
    $_sql: { sql: string; conf: string; confId: number }[];
    $_datos: any[];
    $_errores: {
      error: { message: string; continuar?: boolean };
      conf: string;
    }[];
    $_id_general: number | undefined;
    $_respuesta: {
      configuraciones: any[];
      opciones: {};
      error: {};
      sql?: any[] | undefined;
    };
    $_conf: {
      estructura: any;
      buscarPadre: (id: number) => SConf;
      buscarPadreData: (id_a: string) => string | undefined;
      getIDA: (id: number, estructura?: SConf) => string | undefined;
    };

    usuario: any;
  }
}
