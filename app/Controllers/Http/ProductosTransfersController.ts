import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TransferProducto from 'App/Models/TransferProducto'

export default class ProductosTransfersController {
    public async mig_index(){
        return TransferProducto.traerTrasferProducto();
    }
}
