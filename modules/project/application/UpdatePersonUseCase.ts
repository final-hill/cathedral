import UseCase from "~/application/UseCase";
import Person from "../domain/Person";
import type Repository from "~/application/Repository";
import { emptyUuid } from "~/domain/Uuid";

type In = Pick<Person, 'id' | 'projectId' | 'email' | 'roleId' | 'name'>

export default class UpdatePersonUseCase extends UseCase<In, void> {
    constructor(readonly repository: Repository<Person>) {
        super()
    }

    async execute({ id, name, projectId, email, roleId }: In): Promise<void> {
        return await this.repository.update(new Person({
            id,
            projectId,
            email,
            roleId,
            name,
            parentId: emptyUuid,
            property: '',
            statement: ''
        }))
    }
}