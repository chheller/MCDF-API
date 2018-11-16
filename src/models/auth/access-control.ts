import { Schema, model, Document } from 'mongoose';
import { strict, string } from 'joi';
import { AccessControlGrant } from '../../auth/access-control';

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
export default model('grant', grantSchema);
