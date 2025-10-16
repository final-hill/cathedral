import { Migration } from '@mikro-orm/migrations'

export class Migration20251006145135_RefactorEndorsementsForGeneralization extends Migration {
    override async up(): Promise<void> {
        // Step 1: Update endorsement table structure
        this.addSql(`alter table "endorsement" drop constraint "endorsement_requirement_version_effective_from_re_447f0_unique";`)
        this.addSql(`alter table "endorsement" add column "category" text check ("category" in ('role_based', 'correctness', 'justifiability', 'completeness', 'consistency', 'non_ambiguity', 'feasibility', 'abstractness', 'traceability', 'delimitedness', 'readability', 'modifiability', 'verifiability', 'prioritization')) not null;`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_version_effective_from_re_246e0_unique" unique ("requirement_version_effective_from", "requirement_version_requirement_id", "endorsed_by_id", "category");`)

        // Step 2: Update endorsement status constraint to use 'approved' instead of 'endorsed'
        this.addSql(`alter table "endorsement" drop constraint if exists "endorsement_status_check";`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_status_check" check("status" in ('pending', 'approved', 'rejected'));`)

        // Step 3: Clean existing endorsement data
        this.addSql(`DELETE FROM endorsement;`)

        // Step 4: Reset Review state requirements to Proposed
        this.addSql(`
            UPDATE requirement_versions
            SET workflow_state = 'proposed'
            WHERE workflow_state = 'review';
        `)
    }

    override async down(): Promise<void> {
        // Reverse Step 4: Note - cannot restore original Review states
        // Reverse Step 3: Note - cannot restore deleted endorsements

        // Reverse Step 2: Restore original endorsement status constraint
        this.addSql(`alter table "endorsement" drop constraint if exists "endorsement_status_check";`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_status_check" check("status" in ('pending', 'endorsed', 'rejected'));`)

        // Reverse Step 1: Drop endorsement table changes
        this.addSql(`alter table "endorsement" drop constraint "endorsement_requirement_version_effective_from_re_246e0_unique";`)
        this.addSql(`alter table "endorsement" drop column "category";`)
        this.addSql(`alter table "endorsement" add constraint "endorsement_requirement_version_effective_from_re_447f0_unique" unique ("requirement_version_effective_from", "requirement_version_requirement_id", "endorsed_by_id");`)
    }
}
