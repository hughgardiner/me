import { pgTable } from "./utils";

import { text, integer, timestamp } from "drizzle-orm/pg-core";

export const spotify = pgTable("spotify", {
  id: text("spotify_id").primaryKey(),
  email: text("email").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresIn: integer("expires_in").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
