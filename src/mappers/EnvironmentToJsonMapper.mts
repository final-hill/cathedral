import EntityToJsonMapper, { type EntityJson } from './EntityToJsonMapper.mjs';
import Environment from '~/domain/Environment.mjs';
import SemVer from '~/lib/SemVer.mjs';
import ComponentToJsonMapper, { type ComponentJson } from './ComponentToJsonMapper.mjs';
import ConstraintToJsonMapper, { type ConstraintJson } from './ConstraintToJsonMapper.mjs';
import InvariantToJsonMapper, { type InvariantJson } from './InvariantToJsonMapper.mjs';
import AssumptionToJsonMapper, { type AssumptionJson } from './AssumptionToJsonMapper.mjs';
import EffectToJsonMapper, { type EffectJson } from './EffectToJsonMapper.mjs';
import GlossaryTermToJsonMapper, { type GlossaryTermJson } from './GlossaryTermToJsonMapper.mjs';

export interface EnvironmentJson extends EntityJson {
    glossaryTerms: GlossaryTermJson[];
    constraints: ConstraintJson[];
    invariants: InvariantJson[];
    assumptions: AssumptionJson[];
    effects: EffectJson[];
    components: ComponentJson[];
}

export default class EnvironmentToJsonMapper extends EntityToJsonMapper {
    override mapFrom(target: EnvironmentJson): Environment {
        const sVer = target.serializationVersion,
            version = new SemVer(sVer),
            constraintToJsonMapper = new ConstraintToJsonMapper(sVer),
            invariantToJsonMapper = new InvariantToJsonMapper(sVer),
            assumptionToJsonMapper = new AssumptionToJsonMapper(sVer),
            effectToJsonMapper = new EffectToJsonMapper(sVer),
            componentToJsonMapper = new ComponentToJsonMapper(sVer),
            glossaryTermToJsonMapper = new GlossaryTermToJsonMapper(sVer);

        if (version.gte('0.3.0'))
            return new Environment({
                ...target,
                glossaryTerms: (target.glossaryTerms ?? []).map(glossaryTermToJsonMapper.mapFrom),
                constraints: (target.constraints ?? []).map(constraintToJsonMapper.mapFrom),
                invariants: (target.invariants ?? []).map(invariantToJsonMapper.mapFrom),
                assumptions: (target.assumptions ?? []).map(assumptionToJsonMapper.mapFrom),
                effects: (target.effects ?? []).map(effectToJsonMapper.mapFrom),
                components: (target.components ?? []).map(componentToJsonMapper.mapFrom)
            });

        throw new Error(`Unsupported serialization version: ${version}`);
    }

    override mapTo(source: Environment): EnvironmentJson {
        const sVer = this.serializationVersion,
            constraintToJsonMapper = new ConstraintToJsonMapper(sVer),
            invariantToJsonMapper = new InvariantToJsonMapper(sVer),
            assumptionToJsonMapper = new AssumptionToJsonMapper(sVer),
            effectToJsonMapper = new EffectToJsonMapper(sVer),
            componentToJsonMapper = new ComponentToJsonMapper(sVer),
            glossaryTermToJsonMapper = new GlossaryTermToJsonMapper(sVer);

        return {
            ...super.mapTo(source),
            glossaryTerms: source.glossaryTerms.map(item => glossaryTermToJsonMapper.mapTo(item)),
            constraints: source.constraints.map(item => constraintToJsonMapper.mapTo(item)),
            invariants: source.invariants.map(item => invariantToJsonMapper.mapTo(item)),
            assumptions: source.assumptions.map(item => assumptionToJsonMapper.mapTo(item)),
            effects: source.effects.map(item => effectToJsonMapper.mapTo(item)),
            components: source.components.map(item => componentToJsonMapper.mapTo(item))
        };
    }
}