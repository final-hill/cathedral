import { Migration } from '@mikro-orm/migrations'

export class Migration20251004170730_MakeEndorsementsVersionSpecific extends Migration {
    override async up(): Promise<void> {
        // Remove existing endorsements first since they're incompatible with version-specific structure
        this.addSql(`delete from "endorsement";`)

        this.addSql(`alter table "endorsement" drop constraint "endorsement_requirement_id_foreign";`)

        this.addSql(`alter table "endorsement" drop constraint "endorsement_requirement_id_endorsed_by_id_unique";`)

        this.addSql(`alter table "endorsement" add column "requirement_version_effective_from" timestamptz not null;`)
        this.addSql(`alter table "endorsement" rename column "requirement_id" to "requirement_version_requirement_id";`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_version_effective_from_r_18e9e_foreign" foreign key ("requirement_version_effective_from", "requirement_version_requirement_id") references "requirement_versions" ("effective_from", "requirement_id") on update cascade;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_version_effective_from_re_447f0_unique" unique ("requirement_version_effective_from", "requirement_version_requirement_id", "endorsed_by_id");`)
    }

    override async down(): Promise<void> {
        this.addSql(`alter table "endorsement" drop constraint "endorsement_requirement_version_effective_from_r_18e9e_foreign";`)

        this.addSql(`alter table "endorsement" drop constraint "endorsement_requirement_version_effective_from_re_447f0_unique";`)
        this.addSql(`alter table "endorsement" drop column "requirement_version_effective_from";`)

        this.addSql(`alter table "endorsement" rename column "requirement_version_requirement_id" to "requirement_id";`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_id_foreign" foreign key ("requirement_id") references "requirement" ("id") on update cascade;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_id_endorsed_by_id_unique" unique ("requirement_id", "endorsed_by_id");`)
    }
}
