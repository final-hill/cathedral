import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import Invariant from "../domain/Invariant";

export interface InvariantJson extends RequirementJson { }

export default class InvariantToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: Invariant): InvariantJson {
        return { ...super.mapTo(source) };
    }

    override mapFrom(target: InvariantJson): Invariant {
        return new Invariant({ ...target });
    }
}