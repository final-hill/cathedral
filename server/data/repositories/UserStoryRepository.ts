import UserStory from "~/server/domain/requirements/UserStory";
import PostgresRepository from "./PostgresRepository";
import { type Uuid } from "~/server/domain/Uuid";

export default class UserStoryRepository extends PostgresRepository<UserStory> {
    async add(item: Omit<UserStory, 'id'>): Promise<Uuid> {
        // user_story <: scenario <: example <: behavior <: requirement (Class Table Inheritance)
        const sql = `
            WITH new_req AS (
                INSERT INTO cathedral.requirement (name, solution_id, statement)
                VALUES ($1, $2, $3)
                RETURNING id
            ),
            new_beh AS (
                INSERT INTO cathedral.behavior (id, priority_id)
                VALUES ((SELECT id FROM new_req), $4)
            ),
            new_ex AS (
                INSERT INTO cathedral.example (id)
                VALUES ((SELECT id FROM new_req))
            ),
            new_sce AS (
                INSERT INTO cathedral.scenario (id, primary_actor_id)
                VALUES ((SELECT id FROM new_req), $5)
            ),
            new_use AS (
                INSERT INTO cathedral.user_story (id, outcome_id, functional_behavior_id)
                VALUES ((SELECT id FROM new_req), $6, $7)
            )
                SELECT id FROM new_req
        `;

        const result = await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.priorityId,
            item.primaryActorId,
            item.outcomeId,
            item.functionalBehaviorId
        ]);

        return result.rows[0].id;
    }

    async getAll(criteria: Partial<UserStory> = {}): Promise<UserStory[]> {
        // user_story <: scenario <: example <: behavior <: requirement (Class Table Inheritance)
        // so a join is needed to get all the fields
        const sql = `
            SELECT r.id,
                r.name,
                r.solution_id,
                r.statement,
                s.primary_actor_id,
                b.priority_id,
                us.outcome_id,
                us.functional_behavior_id
            FROM cathedral.requirement r
            JOIN cathedral.behavior b ON r.id = b.id
            JOIN cathedral.example e ON r.id = e.id
            JOIN cathedral.scenario s ON r.id = s.id
            JOIN cathedral.user_story us ON r.id = us.id
            ${this._criteriaToSql(criteria)}
        `;

        type ResponseModel = {
            id: UserStory["id"],
            name: UserStory["name"],
            solution_id: UserStory["solutionId"],
            statement: UserStory["statement"],
            primary_actor_id: UserStory["primaryActorId"],
            priority_id: UserStory["priorityId"],
            outcome_id: UserStory["outcomeId"],
            functional_behavior_id: UserStory["functionalBehaviorId"]
        }

        const result = await this._db.query<ResponseModel>(sql, Object.values(criteria))

        return result.rows.map((row: ResponseModel) => {
            return new UserStory({
                id: row.id,
                name: row.name,
                solutionId: row.solution_id,
                statement: row.statement,
                primaryActorId: row.primary_actor_id,
                priorityId: row.priority_id,
                outcomeId: row.outcome_id,
                functionalBehaviorId: row.functional_behavior_id
            })
        })
    }

    async update(item: UserStory): Promise<void> {
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
            UPDATE cathedral.user_story
            SET outcome_id = $7,
                functional_behavior_id = $8
            WHERE id = $4
        `

        await this._db.query(sql, [
            item.name,
            item.solutionId,
            item.statement,
            item.id,
            item.priorityId,
            item.primaryActorId,
            item.outcomeId,
            item.functionalBehaviorId
        ])
    }
}
