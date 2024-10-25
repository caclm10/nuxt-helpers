import { relations, sql } from "drizzle-orm";
import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const User = table(
    "users",
    {
        id: t.int().primaryKey({ autoIncrement: true }),
        nanoid: t.text().notNull().unique().$default(() => nanoid()),
        name: t.text().notNull(),
        email: t.text().notNull().unique(),
        password: t.text().notNull(),
        createdAt: t.text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
        updatedAt: t.text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    },
);

export const UserSession = table(
    "user_sessions",
    {
        id: t.int().primaryKey({ autoIncrement: true }),
        userId: t.int("user_id").references(() => User.id),
        refreshToken: t.text().notNull().unique(),
        createdAt: t.text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
        updatedAt: t.text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
    }
)

export const UserRelations = relations(User, ({ one }) => ({
    UserSession: one(UserSession)
}));

export const UserSessionRelations = relations(UserSession, ({ one }) => ({
    User: one(User, { fields: [UserSession.userId], references: [User.id] })
}))

