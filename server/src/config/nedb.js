import Datastore from 'nedb-promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFolder = path.join(__dirname, '../../data');

export const db = {
  users: Datastore.create({ filename: path.join(dbFolder, 'users.db'), autoload: true }),
  events: Datastore.create({ filename: path.join(dbFolder, 'events.db'), autoload: true }),
  cities: Datastore.create({ filename: path.join(dbFolder, 'cities.db'), autoload: true }),
  categories: Datastore.create({ filename: path.join(dbFolder, 'categories.db'), autoload: true }),
  reports: Datastore.create({ filename: path.join(dbFolder, 'reports.db'), autoload: true }),
  moderationLogs: Datastore.create({ filename: path.join(dbFolder, 'moderation.db'), autoload: true })
};
