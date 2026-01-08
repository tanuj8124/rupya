import { defineConfig } from "prisma/config";

export default defineConfig({
    datasource: {
        url: "postgresql://postgres:postgres@localhost:5432/securebank?schema=public",
    },
    migrate: {
        datasource: "db",
    },
});
