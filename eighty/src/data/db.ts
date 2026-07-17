import { SqliteRepository } from './sqlite';

/** One shared connection for the whole app — screens no longer each open their own. */
export const repo = new SqliteRepository();
