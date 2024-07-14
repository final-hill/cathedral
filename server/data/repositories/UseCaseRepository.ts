import PostgresRepository from "./PostgresRepository";
import UseCase from "~/server/domain/UseCase";
import { type Uuid } from "~/server/domain/Uuid";

export default class UseCaseRepository extends PostgresRepository<UseCase> {
    async add(item: Omit<UseCase, 'id'>): Promise<Uuid> {
        // use_case <: scenario <: example <: behavior <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_beh AS (
                INSERT INTO cathedral.behavior (id, priority_id)
                VALUES ((SELECT id FROM new_req), $4)
                RETURNING id
            ),
            new_ex AS (
                INSERT INTO cathedral.example (id)
                VALUES ((SELECT id FROM new_req))
                RETURNING id
            ),
            new_sce AS (
                INSERT INTO cathedral.scenario (id, primary_actor_id)
                VALUES ((SELECT id FROM new_req), $5)
                RETURNING id
            ),
            new_use AS (
                INSERT INTO cathedral.use_case (id, scope, level, goal_in_context, precondition_id, trigger_id, main_success_scenario, success_guarantee_id, extensions)
                VALUES ((SELECT id FROM new_req), $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
            )
            SELECT id FROM new_req
        `;

        const result = await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.priorityId,
            item.primaryActorId,
            item.scope,
            item.level,
            item.goalInContext,
            item.preconditionId,
            item.triggerId,
            item.mainSuccessScenario,
            item.successGuaranteeId,
            item.extensions
        ]);

        return result.rows[0].id;
    }

    async getAll(criteria: Partial<UseCase> = {}): Promise<UseCase[]> {
        // use_case <: scenario <: example <: behavior <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id,
               r.name,
               r.solution_id,
               r.statement,
               b.priority_id,
               s.primary_actor_id,
               u.scope,
               u.level,
               u.goal_in_context,
               u.precondition_id,
               u.trigger_id,
               u.main_success_scenario,
               u.success_guarantee_id,
               u.extensions
            FROM cathedral.requirement r
            JOIN cathedral.behavior b ON r.id = b.id
            JOIN cathedral.example e ON r.id = e.id
            JOIN cathedral.scenario s ON r.id = s.id
            JOIN cathedral.use_case u ON r.id = u.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: UseCase["id"]
            name: UseCase["name"]
            priority_id: UseCase["priorityId"]
            statement: UseCase["statement"]
            solution_id: UseCase["solutionId"]
            primary_actor_id: UseCase["primaryActorId"]
            scope: UseCase["scope"]
            level: UseCase["level"]
            goal_in_context: UseCase["goalInContext"]
            precondition_id: UseCase["preconditionId"]
            triggerId: UseCase["triggerId"]
            main_success_scenario: UseCase["mainSuccessScenario"]
            success_guarantee_id: UseCase["successGuaranteeId"]
            extensions: UseCase["extensions"]
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria))

        return result.rows.map((item) => {
            return new UseCase({
                id: item.id,
                name: item.name,
                solutionId: item.solution_id,
                primaryActorId: item.primary_actor_id,
                statement: item.statement,
                priorityId: item.priority_id,
                scope: item.scope,
                level: item.level,
                goalInContext: item.goal_in_context,
                preconditionId: item.precondition_id,
                triggerId: item.triggerId,
                mainSuccessScenario: item.main_success_scenario,
                successGuaranteeId: item.success_guarantee_id,
                extensions: item.extensions
            })
        })
    }

    async update(item: UseCase): Promise<void> {
        // use_case <: scenario <: example <: behavior <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                UPDATE cathedral.requirement
                SET name = $1,
                    solution_id = $2,
                    statement = $3
                WHERE id = $4
            ),
            new_beh AS (
                UPDATE cathedral.behavior
                SET priority_id = $5
                WHERE id = $4
            ),
            new_sce AS (
                UPDATE cathedral.scenario
                SET primary_actor_id = $6
                WHERE id = $4
            )
            UPDATE cathedral.use_case
            SET scope = $7,
                level = $8,
                goal_in_context = $9,
                precondition_id = $10,
                trigger_id = $11,
                main_success_scenario = $12,
                success_guarantee_id = $13,
                extensions = $14
            WHERE id = $4
        `

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.priorityId,
            item.primaryActorId,
            item.scope,
            item.level,
            item.goalInContext,
            item.preconditionId,
            item.triggerId,
            item.mainSuccessScenario,
            item.successGuaranteeId,
            item.extensions
        ]);
    }
}
