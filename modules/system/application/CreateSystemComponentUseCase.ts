import UseCase from "~/application/UseCase";
import type { Uuid } from "~/domain/Uuid";
import type Repository from "~/application/Repository";
import SystemComponent from "../domain/SystemComponent";

type In = Pick<SystemComponent, 'parentId' | 'solutionId' | 'name' | 'statement' | 'systemId'>

export default class CreateSystemComponentUseCase extends UseCase<In, Uuid> {
    constructor(
        readonly componentRepository: Repository<SystemComponent>
    ) { super() }

    async execute({ parentId, name, statement, systemId, solutionId }: In): Promise<Uuid> {
        return await this.componentRepository.add(new SystemComponent({
            id: crypto.randomUUID(),
            solutionId,
            systemId,
            property: '',
            parentId,
            name,
            statement
        }))
    }
}