import { Schema, model, Document } from 'mongoose';

const authSchema = new Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  id: String
});

export interface AuthDocument extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  id: string;
}
export default model('auth', authSchema);
