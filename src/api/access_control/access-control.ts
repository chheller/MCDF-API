import { AccessControl, Permission, IAccessInfo, Query } from 'accesscontrol';
import MAccessControlSvc, { IAccessControlSvc } from './model';

export class AccessControlSingleton {
  private ac: AccessControl;
  private isInitialized: boolean = false;
  constructor(private MAccessControlSvc: IAccessControlSvc) {}

  async initialize() {
    if (this.isInitialized) return;

    const grants: AccessControlGrant[] = await this.MAccessControlSvc.getGrants();
    this.ac = new AccessControl(grants);
    this.isInitialized = true;
  }

  async permissions(
    role: string,
    action: AccessControlAction,
    resource: string
  ): Promise<Permission> {
    await this.initialize();
    try {
      return (<any>this.ac.can(role))[action](resource);
    } catch (err) {
      console.log(err);
    }
  }

  createGrant() {}
}

export interface AccessControlGrant {
  role: string;
  resource: string[];
  action: CRUDActions;
  attributes: string;
  possession: string;
}

export type CRUDActions = 'create' | 'read' | 'update' | 'delete';

export type AccessControlAction =
  | 'create'
  | 'createAny'
  | 'createOwn'
  | 'update'
  | 'updateOwn'
  | 'updateAny'
  | 'read'
  | 'readOwn'
  | 'readAny'
  | 'delete'
  | 'deleteOwn'
  | 'deleteAny';

const accessControlSvc = new AccessControlSingleton(MAccessControlSvc);

export default accessControlSvc;
