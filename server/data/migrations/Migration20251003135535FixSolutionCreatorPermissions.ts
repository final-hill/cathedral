import { Migration } from '@mikro-orm/migrations'

/**
 * Fix Solution Creator Person entities to have proper role capabilities.
 * This migration corrects an issue where existing Solution Creator Person
 * entities don't have the required permissions despite the initialization
 * code setting them correctly.
 */
export class Migration20251003135535FixSolutionCreatorPermissions extends Migration {
    async up(): Promise<void> {
    // Update all Person entities named "Solution Creator" to have proper role capabilities
        this.addSql(`
      UPDATE requirement_versions 
      SET 
        is_product_owner = true,
        is_implementation_owner = true,
        can_endorse_project_requirements = true,
        can_endorse_environment_requirements = true,
        can_endorse_goals_requirements = true,
        can_endorse_system_requirements = true
      WHERE req_type = 'person' 
        AND name = 'Solution Creator'
        AND is_deleted = false;
    `)
    }

    async down(): Promise<void> {
    // Revert the changes by setting all capabilities to false
        this.addSql(`
      UPDATE requirement_versions 
      SET 
        is_product_owner = false,
        is_implementation_owner = false,
        can_endorse_project_requirements = false,
        can_endorse_environment_requirements = false,
        can_endorse_goals_requirements = false,
        can_endorse_system_requirements = false
      WHERE req_type = 'person' 
        AND name = 'Solution Creator'
        AND is_deleted = false;
    `)
    }
}
