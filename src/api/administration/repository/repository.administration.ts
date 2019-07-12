import { readdir } from 'fs';
import { IAdminInfrastructure } from '../application/service.administration';
import * as AdmZip from 'adm-zip';

import { ModData } from '../domain/domain.administration';
import {
  Response,
  SuccessResponse,
  ErrorResponse,
  NotImplementedResponse,
  ServiceUnavailableResponse
} from '../../../global/interfaces';
import { ENABLED_MOD_PATHS, DISABLED_MOD_PATHS } from '../../../core/config/environment';
import { JavaServer, ServerStatus } from './java-server.administration';
import { logger } from '../../../global/logger';
export class AdminInfrastructure implements IAdminInfrastructure {
  private static serverService = new JavaServer();
  constructor() {}

  //#region Public interface
  public static async setup() {
    this.serverService.start();
  }

  public static async teardown() {
    await this.serverService.stop();
  }

  public async getAllMods(): Promise<Response<ModData[], string>> {
    const activeModData: ModData[] = await this.getModData(ENABLED_MOD_PATHS);
    const disabledModData: ModData[] = await this.getModData(DISABLED_MOD_PATHS);
    // TODO: Handle disabled Mods by checking the disabled mods path
    return new SuccessResponse([...activeModData, ...disabledModData]);
  }

  public async disableMod(mod: ModData): Promise<Response<any>> {
    return new NotImplementedResponse();
  }
  public async enableMod(mod: ModData): Promise<Response<any>> {
    return new NotImplementedResponse();
  }
  public async renameMod(mod: ModData): Promise<Response<any>> {
    return new NotImplementedResponse();
  }
  public async restartServer(): Promise<Response<boolean>> {
    try {
      const { payload } = await this.status();
      if (payload.status === 'online') {
        AdminInfrastructure.serverService.restart();
        return new SuccessResponse();
      } else {
        return new ServiceUnavailableResponse();
      }
    } catch (err) {
      return new ErrorResponse(err);
    }
  }

  public async status(): Promise<Response<{ status: ServerStatus }>> {
    try {
      const serverResponse = AdminInfrastructure.serverService.status();
      return new SuccessResponse({ status: serverResponse } as const);
    } catch (err) {
      return new ErrorResponse({ status: 'unknown' } as const);
    }
  }

  //#endregion

  //#region Private helpers
  private async getModData(path: string): Promise<ModData[]> {
    const modPaths = (await this.getModPaths(path)).filter(path => path.includes('.jar'));
    const modDataPromises = modPaths.map(async modPath => {
      try {
        const mcmodinfo = await this.getMcModInfo(`${path}/${modPath}`);
        if (!mcmodinfo) {
          throw `${modPath} did not contain a properly formatted mcmod.info file.`;
        }
        return {
          name: mcmodinfo.data,
          modid: mcmodinfo.modid,
          description: mcmodinfo.description,
          version: mcmodinfo.version,
          logoFile: mcmodinfo.logoFile,
          path: modPath,
          enabled: true
        };
      } catch (err) {
        // TODO: Log or something here
      }
    });
    return Promise.all(modDataPromises);
  }

  private unarchive(archivePath: string) {
    return new AdmZip(archivePath);
  }

  private async getMcModInfo(jarPath: string) {
    try {
      const unarchived = this.unarchive(jarPath);
      const modInfoEntry = unarchived.getEntry('mcmod.info');
      if (!modInfoEntry) {
        throw `${jarPath} did not contain an mcmod.info file.`;
      }
      const zipData = modInfoEntry.getData().toString('utf8');
      const parsed = this.parseMcModInfo(zipData);
      const json = JSON.parse(parsed);
      return Array.isArray(json) ? json[0] : json;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  private parseMcModInfo(modInfo: string) {
    return modInfo.replace(/(\r\n|\n|\r)/gm, ' ');
  }

  private async getModPaths(modsPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      readdir(modsPath, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  //#endregion
}
