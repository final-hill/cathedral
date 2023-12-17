import Requirement from '~/domain/Requirement.mjs';
import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';

export interface RequirementJson extends EntityJson {
    statement: string;
}

export default class RequirementToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: RequirementJson): Requirement {
        return new Requirement(target);
    }
    override mapTo(source: Requirement): RequirementJson {
        return {
            ...super.mapTo(source),
            statement: source.statement
        };
    }
}