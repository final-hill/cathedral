import type Repository from "~/application/Repository";
import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import Goal from "../domain/Goal";

type In = {
    solutionId: Uuid,
    goalsId: Uuid,
    visionStatement: string,
    missionStatement: string,
    situationStatement: string,
    objectiveStatement: string
}

export default class UpdateRationaleUseCase extends UseCase<In, void> {
    constructor(readonly goalRepository: Repository<Goal>) {
        super()
    }

    async execute(
        { solutionId, goalsId, missionStatement, objectiveStatement, situationStatement, visionStatement }: In
    ): Promise<void> {
        const gr = this.goalRepository

        const [vision, mission, situation, objective, outcomes] = await Promise.all([
            gr.getAll(g => g.parentId === goalsId && g.name === 'Vision'),
            gr.getAll(g => g.parentId === goalsId && g.name === 'Mission'),
            gr.getAll(g => g.parentId === goalsId && g.name === 'Situation'),
            gr.getAll(g => g.parentId === goalsId && g.name === 'Objective'),
            gr.getAll(g => g.parentId === goalsId && g.name === 'Outcomes')
        ])

        if (vision.length === 0) {
            await gr.add(new Goal({
                id: crypto.randomUUID(),
                parentId: goalsId,
                solutionId,
                name: 'Vision',
                statement: visionStatement,
                property: ''
            }))
        } else {
            vision[0].statement = visionStatement
            await gr.update(vision[0])
        }

        if (mission.length === 0) {
            await gr.add(new Goal({
                id: crypto.randomUUID(),
                parentId: goalsId,
                solutionId,
                name: 'Mission',
                statement: missionStatement,
                property: ''
            }))
        } else {
            mission[0].statement = missionStatement
            await gr.update(mission[0])
        }

        if (situation.length === 0) {
            await gr.add(new Goal({
                id: crypto.randomUUID(),
                parentId: goalsId,
                solutionId,
                name: 'Situation',
                statement: situationStatement,
                property: ''
            }))
        } else {
            situation[0].statement = situationStatement
            await gr.update(situation[0])
        }

        if (objective.length === 0) {
            await gr.add(new Goal({
                id: crypto.randomUUID(),
                parentId: goalsId,
                solutionId,
                name: 'Objective',
                statement: objectiveStatement,
                property: ''
            }))
        } else {
            objective[0].statement = objectiveStatement
            await gr.update(objective[0])
        }

        if (outcomes.length === 0) {
            await gr.add(new Goal({
                id: crypto.randomUUID(),
                parentId: goalsId,
                solutionId,
                name: 'Outcomes',
                statement: '',
                property: ''
            }))
        }
    }
}