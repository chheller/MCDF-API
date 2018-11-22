import { Schema, model, Document } from 'mongoose';
import { toPOJSO } from '../utils';

const catImgSchema = new Schema({
  id: String,
  title: String,
  img: String,
  description: String,
  resourceOwnerId: String
});
catImgSchema.method('toPOJSO', toPOJSO);

export interface CatsDocument extends Document {
  id: String;
  title: String;
  img: String;
  description: String;
  resourceOwnerId: String;
}
export default model('cats', catImgSchema);
