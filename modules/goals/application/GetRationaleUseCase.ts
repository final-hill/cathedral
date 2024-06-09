import type Repository from "~/application/Repository"
import type { Uuid } from "~/domain/Uuid"
import UseCase from "~/application/UseCase"
import type Goal from "../domain/Goal"

type Out = {
    vision: string,
    mission: string,
    situation: string,
    objective: string
}

export default class GetRationaleUseCase extends UseCase<Uuid, Out> {
    constructor(
        readonly goalRepository: Repository<Goal>
    ) { super() }

    async execute(goalsId: Uuid): Promise<Out> {
        const gr = this.goalRepository

        const [vision, mission, situation, objective] = await Promise.all([
            gr.getAll(g => g.parentId === goalsId && g.name === 'Vision'),
            gr.getAll(g => g.parentId === goalsId && g.name === 'Mission'),
            gr.getAll(g => g.parentId === goalsId && g.name === 'Situation'),
            gr.getAll(g => g.parentId === goalsId && g.name === 'Objective')
        ])

        return {
            vision: vision[0]?.statement || '',
            mission: mission[0]?.statement || '',
            situation: situation[0]?.statement || '',
            objective: objective[0]?.statement || ''
        }
    }
}