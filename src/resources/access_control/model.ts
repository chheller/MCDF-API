import { AccessControlGrant } from './access-control';
import { Schema, model, Document } from 'mongoose';
export interface IAccessControlSvc {
  getGrants(): Promise<AccessControlGrant[]>;
}
const grantSchema = new Schema(
  {
    role: String,
    resource: Array,
    action: String,
    attributes: String,
    possession: String,
    id: String
  },
  { strict: true }
);

export interface GrantDocument extends Document, AccessControlGrant {}

export const GrantModel = model('grant', grantSchema);

class AccessControlSvc implements IAccessControlSvc {
  // TODO: Initialize Grants from database
  constructor() {}

  async getGrants(): Promise<AccessControlGrant[]> {
    return await this.retrieveAllGrants();
  }

  //TODO: Implement saving grants to DB
  private async saveGrant() {}

  private async retrieveAllGrants(): Promise<AccessControlGrant[]> {
    return (await GrantModel.find()
      .lean()
      .exec()).map((leanGrantDoc: GrantDocument) => {
      const { role, resource, action, attributes, possession, id } = leanGrantDoc;
      return { role, resource, action, attributes, possession, id };
    });
  }
}

export default new AccessControlSvc() as IAccessControlSvc;
