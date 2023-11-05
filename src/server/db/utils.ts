import { pgTableCreator } from "drizzle-orm/pg-core";

export const pgTable = pgTableCreator((name) => `me_${name}`);
