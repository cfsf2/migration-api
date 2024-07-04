import __SConf from "App/Models/SConf";
import SCTPV from "App/Models/SConfTipoAtributoValor";
import SCC from "App/Models/SConfCpsc";
import SRC from "App/Models/SRc";
import SRD from "App/Models/SRcDeta";
import SP from "App/Models/SPista";
import SCCU from "App/Models/SConfConfUsuario";
import SCCD from "App/Models/SConfConfDeta";

import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import FS from "App/Models/FarmaciaServicio";
import FD from "App/Models/FarmaciaDrogueria";
import FL from "App/Models/FarmaciaLaboratorio";

import U from "App/Models/Usuario";
import _UsuarioFarmaciaFavorita from "App/Models/UsuarioFarmaciaFavorita";
import _UsuarioPerfil from "App/Models/UsuarioPerfil";

import T from "App/Models/Transfer";
import _TransferEmail from "App/Models/TransferEmail";
import TP from "App/Models/TransferProducto";
import _TransferProductoInstitucion from "App/Models/TransferProductoInstitucion";
import TTP from "App/Models/TransferTransferProducto";

import L from "App/Models/Laboratorio";
import _LaboratorioDrogueria from "App/Models/LaboratorioDrogueria";
import _Apm from "App/Models/Apm";
import _ApmFarmacia from "App/Models/ApmFarmacia";
import DR from "App/Models/Drogueria";

import R from "App/Models/Recupero";
import RD from "App/Models/RecuperoDiagnostico";
import RE from "App/Models/RecuperoEstadio";
import RLT from "App/Models/RecuperoLineaTratamiento";
import RPS from "App/Models/RecuperoPerformanceStatus";
import DGN from "App/Models/Diagnostico";
import ESTD from "App/Models/Estadio";
import LT from "App/Models/LineaTratamiento";
import PS from "App/Models/PerformanceStatus";
import M from "App/Models/Monodro";

import _Campana from "App/Models/Campana";
import _CampanaAtributo from "App/Models/CampanaAtributo";

import _CampanaCampanaAtributo from "App/Models/CampanaCampanaAtributo";

import _CampanaCampanaOrientado from "App/Models/CampanaCampanaOrientado";
import _CampanaOrientado from "App/Models/CampanaOrientado";
import _CampanaRequerimiento from "App/Models/CampanaRequerimiento";
import _CampanaResponsable from "App/Models/CampanaResponsable";
import _Categoria from "App/Models/Categoria";

import _DebitoFarmacia from "App/Models/Debitofarmacia";
import _Denuncia from "App/Models/Denuncia";
import _DenunciaTipo from "App/Models/DenunciaTipo";
import _Departamento from "App/Models/Departamento";
import _Dia from "App/Models/Dia";

import _EstadoPedido from "App/Models/EstadoPedido";
import _EstadoTransfer from "App/Models/EstadoTransfer";
import _FarmaciaDia from "App/Models/FarmaciaDia";
import _FarmaciaEntidad from "App/Models/FarmaciaEntidad";
import _FarmaciaInstitucion from "App/Models/FarmaciaInstitucion";
import _FarmaciaMedioDePago from "App/Models/FarmaciaMedioDePago";
import _FarmaciaProductoCustom from "App/Models/FarmaciaProductoCustom";
import _FarmaciaProductoPack from "App/Models/FarmaciaProductoPack";

import _Institucion from "App/Models/Institucion";
import _Qr from "App/Models/Qr";
import _QrInstitucion from "App/Models/QrInstitucion";
import _QrFarmacia from "App/Models/QrFarmacia";
import _Inventario from "App/Models/Inventario";
import _LaboratorioModalidadEntrega from "App/Models/LaboratorioModalidadEntrega";
import _LaboratorioTipoComunicacion from "App/Models/LaboratorioTipoComunicacion";
import _Localidad from "App/Models/Localidad";
import _MedioDePago from "App/Models/MedioDePago";
import _Pedido from "App/Models/Pedido";
import _PedidoProductoPack from "App/Models/PedidoProductoPack";
import _Perfil from "App/Models/Perfil";
import _PerfilFarmageo from "App/Models/PerfilFarmageo";
import _PerfilPermiso from "App/Models/PerfilPermiso";
import _Permiso from "App/Models/Permiso";
import _ProductoCustom from "App/Models/ProductoCustom";
import _ProductoPack from "App/Models/ProductoPack";
import _Provincia from "App/Models/Provincia";
import _Publicidad from "App/Models/Publicidad";
import _PublicidadColor from "App/Models/PublicidadColor";
import _PublicidadInstitucion from "App/Models/PublicidadInstitucion";
import _PublicidadTipo from "App/Models/PublicidadTipo";

import _Repoo from "App/Models/Repoo";
import _SAtributo from "App/Models/SAtributo";
import _SComponente from "App/Models/SComponente";
import _SConfPermiso from "App/Models/SConfPermiso";
import _SErrorMysql from "App/Models/SErrorMysql";
import _STipo from "App/Models/STipo";
import _STipoAtributo from "App/Models/STipoAtributo";
import _STipoComponente from "App/Models/STipoComponente";

import _TipoInformeTransfer from "App/Models/TipoInformeTransfer";
import _TransferCategoria from "App/Models/TransferCategoria";

import _Menu from "App/Models/Menu";
import _MenuItem from "App/Models/MenuItem";
import _MenuItemCpsc from "App/Models/MenuItemCpsc";
import _MenuItemInstitucion from "App/Models/MenuItemInstitucion";
import _MenuItemPermiso from "App/Models/MenuItemPermiso";
import _MenuItemTipo from "App/Models/MenuItemTipo";

import _EventoParticipante from "App/Models/EventoParticipante";
import _Evento from "App/Models/Evento";

export let EventoParticipante = _EventoParticipante;
export let Evento = _Evento;

export let Menu = _Menu;
export let MenuItem = _MenuItem;
export let MenuItemCpsc = _MenuItemCpsc;
export let MenuItemPermiso = _MenuItemPermiso;
export let MenuItemTipo = _MenuItemTipo;

export let RecuperoDiagnostico = RD;
export let RecuperoEstadio = RE;
export let RecuperoLineaTratamiento = RLT;
export let RecuperoPerformanceStatus = RPS;
export let Diagnostico = DGN;
export let Estadio = ESTD;
export let LineaTratamiento = LT;
export let PerformanceStatus = PS;
export let Monodro = M;

export let Servicio = S;
export let Farmacia = F;
export let FarmaciaServicio = FS;
export let FarmaciaDrogueria = FD;
export let FarmaciaLaboratorio = FL;

export let Transfer = T;
export let TransferProducto = TP;
export let TransferTransferProducto = TTP;
export let TransferEmail = _TransferEmail;
export let TransferCategoria = _TransferCategoria;

export let Laboratorio = L;
export let LaboratorioDrogueria = _LaboratorioDrogueria;
export let UsuarioFarmaciaFavorita = _UsuarioFarmaciaFavorita;
export let Apm = _Apm;
export let UsuarioPerfil = _UsuarioPerfil;
export let ApmFarmacia = _ApmFarmacia;
export let Drogueria = DR;

export let SConf = __SConf;
export let _SConf = __SConf;
export let TransferProductoInstitucion = _TransferProductoInstitucion;
export let SConfTipoAtributoValor = SCTPV;
export let SConfCpsc = SCC;
export let SRc = SRC;
export let SRcDeta = SRD;
export let SPista = SP;
export let SConfConfUsuario = SCCU;
export let SConfConfDeta = SCCD;

export let Usuario = U;

export let Recupero = R;
export let STipoComponente = _STipoComponente;
export let STipoAtributo = _STipoAtributo;
export let STipo = _STipo;
export let SErrorMysql = _SErrorMysql;
export let SConfPermiso = _SConfPermiso;
export let SComponente = _SComponente;
export let SAtributo = _SAtributo;
export let Repoo = _Repoo;
export let PublicidadTipo = _PublicidadTipo;
export let PublicidadInstitucion = _PublicidadInstitucion;
export let PublicidadColor = _PublicidadColor;
export let Publicidad = _Publicidad;
export let Provincia = _Provincia;
export let ProductoPack = _ProductoPack;
export let ProductoCustom = _ProductoCustom;
export let Permiso = _Permiso;
export let PerfilPermiso = _PerfilPermiso;
export let PerfilFarmageo = _PerfilFarmageo;
export let Perfil = _Perfil;
export let PedidoProductoPack = _PedidoProductoPack;
export let Pedido = _Pedido;
export let MedioDePago = _MedioDePago;
export let Localidad = _Localidad;
export let LaboratorioTipoComunicacion = _LaboratorioTipoComunicacion;
export let LaboratorioModalidadEntrega = _LaboratorioModalidadEntrega;
export let Inventario = _Inventario;
export let Institucion = _Institucion;
export let Qr = _Qr;
export let QrInstitucion = _QrInstitucion;
export let QrFarmacia = _QrFarmacia;
export let FarmaciaProductoPack = _FarmaciaProductoPack;
export let FarmaciaProductoCustom = _FarmaciaProductoCustom;
export let FarmaciaMedioDePago = _FarmaciaMedioDePago;
export let FarmaciaInstitucion = _FarmaciaInstitucion;
export let FarmaciaEntidad = _FarmaciaEntidad;
export let FarmaciaDia = _FarmaciaDia;
export let EstadoTransfer = _EstadoTransfer;
export let EstadoPedido = _EstadoPedido;
export let Dia = _DebitoFarmacia;
export let Departamento = _Departamento;
export let DenunciaTipo = _DenunciaTipo;
export let Denuncia = _Denuncia;
export let Debitofarmacia = _DebitoFarmacia;
export let Categoria = _Categoria;
export let CampanaResponsable = _CampanaResponsable;
export let CampanaRequerimiento = _CampanaRequerimiento;
export let CampanaOrientado = _CampanaOrientado;
export let CampanaCampanaOrientado = _CampanaCampanaOrientado;
export let CampanaCampanaAtributo = _CampanaCampanaAtributo;
export let CampanaAtributo = _CampanaAtributo;
export let Campana = _Campana;
export let TipoInformeTransfer = _TipoInformeTransfer;

import _InstitucionQr from "App/Models/InstitucionQr";
import _FarmaciaQr from "App/Models/FarmaciaQr";

export let InstitucionQr = _InstitucionQr;
export let FarmaciaQr = _FarmaciaQr;

import _Comisionista from "App/Models/Comisionista";
import _QrPresentacion from "App/Models/QrPresentacion";

export let Comisionista = _Comisionista;
export let QrPresentacion = _QrPresentacion;
