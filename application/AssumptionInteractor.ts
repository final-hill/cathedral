import { Assumption } from "~/domain/requirements";
import RequirementInteractor from "./RequirementInteractor";

export default class AssumptionInteractor extends RequirementInteractor<Assumption> {
    async createAssumption(assumption: ConstructorParameters<typeof Assumption>[0]): Promise<Assumption> {
        const newAssumption = this.repository.create(assumption)

        await this.repository.getEntityManager().persistAndFlush(newAssumption)

        return newAssumption
    }
}