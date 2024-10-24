import path from "path";
import cwd from "@stdlib/process-cwd";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

import * as schema from "../db/schema";

const sqlite = new Database(path.join(cwd(), "server", "db", "db.sqlite"));
export const $db = drizzle({ client: sqlite, schema });
