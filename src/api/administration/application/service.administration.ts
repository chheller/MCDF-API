import { ModData } from '../domain/domain.administration';
import { Response, ResponseTypes } from '../../../global/interfaces';
import { AdminInfrastructure } from '../repository/repository.administration';
import { ModsUpdateRequest } from '../interface/controller.administration';
import { ServerStatus } from '../repository/java-server.administration';

export interface IAdminInfrastructure {
  getAllMods(): Promise<Response<ModData[], string>>;
  enableMod(mod: ModData): Promise<Response<any>>;
  disableMod(mod: ModData): Promise<Response<any>>;
  renameMod(mod: ModData): Promise<Response<any>>;
  restartServer(): Promise<Response<any>>;
  status(): Promise<Response<{ status: ServerStatus }>>;
}

export class AdminService {
  constructor(private adminInfra: IAdminInfrastructure = new AdminInfrastructure()) {}

  public async commitModUpdate(updateRequest: ModsUpdateRequest[]) {
    const stagedUpdates = updateRequest.map(async request => {
      switch (request.type) {
        case 'disable':
          return await this.disableMod(request.modData);
        case 'enable':
          return await this.enableMod(request.modData);
        case 'rename':
          return await this.renameMod(request.modData);
      }
    });
    const results = await Promise.all(stagedUpdates);
    const successUpdates = results.filter(result => result.type === ResponseTypes.success);
    const failedUpdates = results.filter(result => result.type !== ResponseTypes.success);
  }
  public async getAllMods(): Promise<Response<ModData[], string>> {
    return this.adminInfra.getAllMods();
  }
  public async enableMod(mod: ModData): Promise<Response<any>> {
    return this.adminInfra.enableMod(mod);
  }
  public async disableMod(mod: ModData): Promise<Response<any>> {
    return this.adminInfra.disableMod(mod);
  }
  public async renameMod(mod: ModData): Promise<Response<any>> {
    return this.adminInfra.renameMod(mod);
  }
  public async restartServer(): Promise<Response<any>> {
    return this.adminInfra.restartServer();
  }
  public async status(): Promise<Response<{ status: ServerStatus }>> {
    return this.adminInfra.status();
  }
}
