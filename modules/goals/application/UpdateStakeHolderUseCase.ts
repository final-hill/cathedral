import UseCase from "~/application/UseCase";
import type { Properties } from "~/domain/Properties";
import type Stakeholder from "../domain/Stakeholder";
import type Repository from "~/application/Repository";

type In = Properties<Omit<Stakeholder, 'category' | 'property'>>

export default class UpdateStakeHolderUseCase extends UseCase<In, void> {
    constructor(readonly repository: Repository<Stakeholder>) {
        super();
    }

    async execute({ id, ...props }: In): Promise<void> {
        const stakeholder = await this.repository.get(id)

        if (!stakeholder)
            throw new Error('Stakeholder not found')

        Object.assign(stakeholder, props)

        await this.repository.update(stakeholder)
    }
}