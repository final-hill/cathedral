import type Repository from "~/application/Repository"
import UseCase from "~/application/UseCase"
import Person from "../domain/Person"
import { emptyUuid, type Uuid } from "~/domain/Uuid"

type In = Pick<Person, 'projectId' | 'solutionId' | 'email' | 'roleId' | 'name'>

export default class CreatePersonUseCase extends UseCase<In, Uuid> {
    constructor(readonly repository: Repository<Person>) {
        super()
    }

    async execute({ name, projectId, solutionId, email, roleId }: In): Promise<Uuid> {
        return await this.repository.add(new Person({
            id: crypto.randomUUID(),
            projectId,
            solutionId,
            email,
            roleId,
            name,
            parentId: emptyUuid,
            property: '',
            statement: ''
        }))
    }
}