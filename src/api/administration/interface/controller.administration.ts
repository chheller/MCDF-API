import { NextFunction } from 'connect';
import { Request, Response, Router } from 'express';
import { controller, get, post } from '../../../core/decorators/express-route-decorators';
import { BaseController } from '../../../global/base-controller';
import { ResponseTypes } from '../../../global/interfaces';
import { AdminService } from '../application/service.administration';
import { ModData } from '../domain/domain.administration';

@controller('/administration')
export class AdminController extends BaseController {
  constructor(router?: Router, private modsService = new AdminService()) {
    super(router);
  }

  @get('/server/mods')
  public async getAllMods(req: Request, res: Response, next: NextFunction) {
    const serviceResponse = await this.modsService.getAllMods();
    const { status, payload, type } = serviceResponse;
    switch (serviceResponse.type) {
      case ResponseTypes.success:
        return res.status(status).json({ payload });
      default:
        next(serviceResponse);
        break;
    }
  }

  @post('/server/update-mods')
  public async updateMods(req: Request, res: Response, next: NextFunction) {
    const updateRequest = req.body as ModsUpdateRequest[];
    const stagedUpdates = this.modsService.commitModUpdate(updateRequest);
  }

  @post('/server/restart')
  public async restartServer(req: Request, res: Response, next: NextFunction) {
    const serviceResponse = await this.modsService.restartServer();
    res.status(serviceResponse.status).send(serviceResponse.message);
  }

  @get('/server/status')
  public async getServerStatus(req: Request, res: Response, next: NextFunction) {
    const serviceResponse = await this.modsService.status();

    res.status(serviceResponse.status).send(serviceResponse.payload);
  }
}

export interface ModsUpdateRequest {
  modData: ModData;
  type: 'rename' | 'disable' | 'enable';
}
