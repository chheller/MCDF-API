import { AccessControl, Permission, IAccessInfo, Query } from 'accesscontrol';

export class AccessControlService {
  private ac: AccessControl;
  constructor(grants: AccessControlGrant[]) {
    this.ac = new AccessControl(grants);
  }

  permissions(role: string, action: AccessControlAction, resource: string): Permission {
    try {
      return (<any>this.ac.can(role))[action](resource);
    } catch (err) {
      console.log(err);
    }
  }
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
