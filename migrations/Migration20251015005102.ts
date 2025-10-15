import { Migration } from '@mikro-orm/migrations'

export class Migration20251015005102 extends Migration {
    override async up(): Promise<void> {
    // Update check constraint to remove Stakeholder categories
    // Stakeholder category is now a derived field computed from interest and influence
        
        // First, clear category values for stakeholders since they will be computed
        this.addSql(`update "requirement_versions" set "category" = null where "req_type" = 'stakeholder';`)
        
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_category_check";`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_category_check" check("category" in ('Business Rule', 'Physical Law', 'Engineering Decision'));`)
    }

    override async down(): Promise<void> {
    // Restore check constraint with Stakeholder categories
        this.addSql(`alter table "requirement_versions" drop constraint if exists "requirement_versions_category_check";`)

        this.addSql(`alter table "requirement_versions" add constraint "requirement_versions_category_check" check("category" in ('Business Rule', 'Physical Law', 'Engineering Decision', 'Key Stakeholder', 'Shadow Influencer', 'Fellow Traveler', 'Observer'));`)

        // Restore category values for stakeholders based on interest and influence
        this.addSql(`update "requirement_versions" 
            set "category" = case
                when "interest" >= 50 and "influence" >= 50 then 'Key Stakeholder'
                when "interest" < 50 and "influence" >= 50 then 'Shadow Influencer'
                when "interest" >= 50 and "influence" < 50 then 'Observer'
                else 'Fellow Traveler'
            end
            where "req_type" = 'stakeholder' 
              and "interest" is not null 
              and "influence" is not null;`)
    }
}
