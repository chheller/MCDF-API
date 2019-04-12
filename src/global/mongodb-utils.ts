import { MongoClient, Db } from "mongodb";
import environment from "../core/config/environment";
const {
  MONGO_ADMIN_USERNAME,
  MONGO_ADMIN_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  DEFAULT_DB_URI
} = environment;

export const connectToMongo = async (
  dbUri: string = DEFAULT_DB_URI
): Promise<Db> => {
  try {
    const mongoConnectionString = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${dbUri}`;

    console.log(mongoConnectionString);
    const db = (await MongoClient.connect(mongoConnectionString, {
      auth: { user: MONGO_ADMIN_USERNAME, password: MONGO_ADMIN_PASSWORD },

      useNewUrlParser: true
    })).db();
    // TODO: Log
    return db;
  } catch (err) {
    // TODO: Log
    throw err;
  }
};

export const getCollection = (db: Db, collectionName: string) => {
  try {
    const collection = db.collection(collectionName);
    // TODO: Log
    return collection;
  } catch (err) {
    // TODO: Log
    throw err;
  }
};
