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

import T from "App/Models/Transfer";
import TP from "App/Models/TransferProducto";
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

export let Recupero = R;
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

export let Laboratorio = L;
export let LaboratorioDrogueria = _LaboratorioDrogueria;
export let Apm = _Apm;
export let ApmFarmacia = _ApmFarmacia;
export let Drogueria = DR;

export let SConf = __SConf;
export let _SConf = __SConf;
export let SConfTipoAtributoValor = SCTPV;
export let SConfCpsc = SCC;
export let SRc = SRC;
export let SRcDeta = SRD;
export let SPista = SP;
export let SConfConfUsuario = SCCU;
export let SConfConfDeta = SCCD;

export let Usuario = U;
