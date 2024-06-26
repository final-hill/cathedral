import type { PGliteInterface } from "@electric-sql/pglite";
import Migration from "../Migration";

export default class AppUser_00002 extends Migration {
    async up(db: PGliteInterface): Promise<void> {
        const sql = `
            CREATE TABLE cathedral.app_user (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(320) NOT NULL,
                display_name VARCHAR(320) NOT NULL,
                public_key VARCHAR(2048) NOT NULL
            );
        `

        await db.exec(sql)
    }

    async down(db: PGliteInterface): Promise<void> {
        const sql = `
            DROP TABLE cathedral.app_user;
        `

        await db.exec(sql)
    }
}