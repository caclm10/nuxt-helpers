import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "sqlite",
    schema: "./server/db/schema.ts",
    out: "./server/db/migrations",
    dbCredentials: {
        url: "file:./server/db/db.sqlite" // file: prefix is required by libsql
    }
})
