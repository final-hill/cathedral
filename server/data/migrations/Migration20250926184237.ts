import { Migration } from '@mikro-orm/migrations'

export class Migration20250926184237 extends Migration {
    override async up(): Promise<void> {
        // First, add the new columns (keeping email temporarily for data migration)
        this.addSql(`alter table "requirement_versions" add column "app_user_id" varchar(766) null, add column "can_endorse_environment_requirements" boolean null default false, add column "can_endorse_goals_requirements" boolean null default false, add column "can_endorse_system_requirements" boolean null default false;`)
        this.addSql(`alter table "requirement_versions" rename column "can_endorse_requirements" to "can_endorse_project_requirements";`)

        // For Role entities with existing endorsement permissions, enable all granular permissions
        // Product Owner and Implementation Owner roles get full permissions automatically
        this.addSql(`
      UPDATE requirement_versions
      SET can_endorse_environment_requirements = true,
          can_endorse_goals_requirements = true,
          can_endorse_system_requirements = true
      WHERE req_type = 'role'
        AND (can_endorse_project_requirements = true
             OR is_product_owner = true
             OR is_implementation_owner = true)
        AND NOT is_deleted;
    `)

        this.addSql(`alter table "requirement_versions" drop column "email";`)

        // Initialize existing solutions with mandatory roles
        // Note: app_user_id is set to the solution's created_by_id (Organization Admin)
        // Clean up any partial data from previous failed migration attempts
        this.addSql(`
      DELETE FROM requirement_versions 
      WHERE req_type = 'role' 
        AND name IN ('Product Owner', 'Implementation Owner')
        AND (is_product_owner = true OR is_implementation_owner = true);
    `)

        this.addSql(`
      DELETE FROM requirement_versions 
      WHERE req_type = 'person' 
        AND name = 'Solution Creator' 
        AND description = 'Initial person for solution administration';
    `)

        this.addSql(`
      DELETE FROM requirement 
      WHERE id NOT IN (SELECT DISTINCT requirement_id FROM requirement_versions);
    `)

        // For each existing solution, create mandatory Person, Product Owner, and Implementation Owner roles
        // Using a temporary table approach to handle the complex relationships

        // Create a temporary table with the solutions that need mandatory roles
        this.addSql(`
      CREATE TEMPORARY TABLE temp_solutions_needing_roles AS
      SELECT DISTINCT requirement_id as solution_id, modified_by_id as created_by
      FROM requirement_versions
      WHERE req_type = 'solution' AND NOT is_deleted;
    `)

        // Create Person entities for solution creators (one per solution-creator combination)
        this.addSql(`
      INSERT INTO requirement (id, created_by_id, creation_date, req_type)
      SELECT uuid7(NOW()), created_by, NOW(), 'person'
      FROM temp_solutions_needing_roles t
      WHERE NOT EXISTS (
        SELECT 1 FROM requirement_versions rv
        WHERE rv.solution_id = t.solution_id
          AND rv.req_type = 'person'
          AND rv.modified_by_id = t.created_by
          AND NOT rv.is_deleted
      );
    `)

        this.addSql(`
      INSERT INTO requirement_versions (
        requirement_id, version, solution_id, req_type, name, description,
        app_user_id, modified_by_id, effective_from, is_deleted, workflow_state
      )
      SELECT r.id, 1, t.solution_id, 'person', 'Solution Creator', 'Initial person for solution administration',
             t.created_by, t.created_by, NOW(), false, 'Active'
      FROM temp_solutions_needing_roles t
      INNER JOIN requirement r ON r.created_by_id = t.created_by AND r.req_type = 'person'
        AND r.creation_date >= (SELECT MIN(NOW()) FROM temp_solutions_needing_roles)
      WHERE NOT EXISTS (
        SELECT 1 FROM requirement_versions rv
        WHERE rv.solution_id = t.solution_id
          AND rv.req_type = 'person'
          AND rv.modified_by_id = t.created_by
          AND NOT rv.is_deleted
      );
    `)

        // Create Product Owner roles (one per solution) - using unique timestamps
        this.addSql(`
      INSERT INTO requirement (id, created_by_id, creation_date, req_type)
      SELECT uuid7(NOW() + (ROW_NUMBER() OVER() || ' microseconds')::interval), created_by, NOW(), 'role'
      FROM temp_solutions_needing_roles;
    `)

        this.addSql(`
      INSERT INTO requirement_versions (
        requirement_id, version, solution_id, req_type, name, description,
        is_product_owner, can_endorse_project_requirements,
        can_endorse_environment_requirements, can_endorse_goals_requirements,
        can_endorse_system_requirements,
        modified_by_id, effective_from, is_deleted, workflow_state
      )
      SELECT r.id, 1, t.solution_id, 'role', 'Product Owner', 'Responsible for defining and prioritizing requirements',
             true, true, true, true, true,
             t.created_by, NOW() + (ROW_NUMBER() OVER() || ' microseconds')::interval, false, 'Active'
      FROM temp_solutions_needing_roles t
      CROSS JOIN LATERAL (
        SELECT id FROM requirement r2 
        WHERE r2.created_by_id = t.created_by 
          AND r2.req_type = 'role'
          AND NOT EXISTS (
            SELECT 1 FROM requirement_versions rv 
            WHERE rv.requirement_id = r2.id
          )
        LIMIT 1
      ) r;
    `)

        // Create Implementation Owner roles (one per solution) - using unique timestamps
        this.addSql(`
      INSERT INTO requirement (id, created_by_id, creation_date, req_type)
      SELECT uuid7(NOW() + (ROW_NUMBER() OVER() + 1000 || ' microseconds')::interval), created_by, NOW(), 'role'
      FROM temp_solutions_needing_roles;
    `)

        this.addSql(`
      INSERT INTO requirement_versions (
        requirement_id, version, solution_id, req_type, name, description,
        is_implementation_owner, can_endorse_project_requirements,
        can_endorse_environment_requirements, can_endorse_goals_requirements,
        can_endorse_system_requirements,
        modified_by_id, effective_from, is_deleted, workflow_state
      )
      SELECT r.id, 1, t.solution_id, 'role', 'Implementation Owner', 'Responsible for technical implementation and system design',
             true, true, true, true, true,
             t.created_by, NOW() + (ROW_NUMBER() OVER() + 1000 || ' microseconds')::interval, false, 'Active'
      FROM temp_solutions_needing_roles t
      CROSS JOIN LATERAL (
        SELECT id FROM requirement r2 
        WHERE r2.created_by_id = t.created_by 
          AND r2.req_type = 'role'
          AND NOT EXISTS (
            SELECT 1 FROM requirement_versions rv 
            WHERE rv.requirement_id = r2.id
          )
        LIMIT 1
      ) r;
    `)

        // Clean up temporary table
        this.addSql(`DROP TABLE temp_solutions_needing_roles;`)
    }

    override async down(): Promise<void> {
        // Clean up the data changes made by this migration
        this.addSql(`
      DELETE FROM requirement_versions
      WHERE req_type = 'role'
        AND (is_product_owner = true OR is_implementation_owner = true)
        AND name IN ('Product Owner', 'Implementation Owner');
    `)

        this.addSql(`
      DELETE FROM requirement_versions
      WHERE req_type = 'person'
        AND description = 'Initial person for solution administration';
    `)

        this.addSql(`
      DELETE FROM requirement
      WHERE id NOT IN (
        SELECT DISTINCT requirement_id FROM requirement_versions
      );
    `)

        // Add email column back
        this.addSql(`alter table "requirement_versions" add column "email" varchar(254) null;`)

        // Note: Email cannot be restored from AppUser entities since they're external.
        // The email column will be restored as empty for rollback compatibility.

        // Rename and drop columns
        this.addSql(`alter table "requirement_versions" rename column "can_endorse_project_requirements" to "can_endorse_requirements";`)
        this.addSql(`alter table "requirement_versions" drop column "app_user_id", drop column "can_endorse_environment_requirements", drop column "can_endorse_goals_requirements", drop column "can_endorse_system_requirements";`)
    }
}
