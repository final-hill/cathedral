import RequirementToJsonMapper, { type RequirementJson } from "~/mappers/RequirementToJsonMapper";
import GlossaryTerm from "../domain/GlossaryTerm";

export interface GlossaryTermJson extends RequirementJson {

}

export default class GlossaryTermToJsonMapper extends RequirementToJsonMapper {
    override mapTo(source: GlossaryTerm): GlossaryTermJson {
        return {
            ...super.mapTo(source)
        };
    }

    override mapFrom(target: GlossaryTermJson): GlossaryTerm {
        return new GlossaryTerm({
            ...super.mapFrom(target),
        });
    }
}