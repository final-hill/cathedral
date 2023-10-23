import { Environment } from "~/domain/Environment";
import { type Mapper } from "~/usecases/Mapper";
import { type GlossaryJson, GlossaryJsonMapper } from "./GlossaryJsonMapper";

export interface EnvironmentJson {
    id: string;
    name: string;
    description: string;
    glossary: GlossaryJson
}

const glossaryJsonMapper = new GlossaryJsonMapper();

export class EnvironmentJsonMapper implements Mapper<Environment, EnvironmentJson> {
    mapFrom(from: Environment): EnvironmentJson {
        return {
            id: from.id,
            name: from.name,
            description: from.description,
            glossary: glossaryJsonMapper.mapFrom(from.glossary)
        }
    }
    mapTo(to: EnvironmentJson): Environment {
        return new Environment({
            id: to.id,
            name: to.name,
            description: to.description,
            glossary: glossaryJsonMapper.mapTo(to.glossary)
        });
    }
}