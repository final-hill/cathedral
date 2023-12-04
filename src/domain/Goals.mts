/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import type { Properties } from '~/types/Properties.mjs';
import type { Uuid } from '~/types/Uuid.mjs';
import { PEGS, type PEGSJson } from './PEGS.mjs';

export interface GoalsJson extends PEGSJson {
    functionalBehaviors: Uuid[];
    objective: string;
    outcomes: string;
    situation: string;
    stakeholders: Uuid[];
}

/**
 * Goals are the needs and wants of an organization.
 * They are the things that the organization wants to achieve.
 */
export class Goals extends PEGS {
    static override fromJSON(json: GoalsJson): Goals {
        return new Goals({
            functionalBehaviors: json.functionalBehaviors,
            id: json.id,
            description: json.description,
            name: json.name,
            objective: json.objective,
            outcomes: json.outcomes,
            situation: json.situation,
            stakeholders: json.stakeholders
        });
    }

    /**
     * Functional behaviors specify what results or effects are expected from the system.
     * They specify "what" the system should do, not "how" it should do it.
     */
    functionalBehaviors: Uuid[];
    objective: string;
    outcomes: string;
    stakeholders: Uuid[];
    situation: string;

    constructor(options: Properties<Goals>) {
        super(options);
        this.functionalBehaviors = options.functionalBehaviors;
        this.objective = options.objective;
        this.outcomes = options.outcomes;
        this.stakeholders = options.stakeholders;
        this.situation = options.situation;
    }

    override toJSON(): GoalsJson {
        return {
            ...super.toJSON(),
            functionalBehaviors: this.functionalBehaviors,
            objective: this.objective,
            outcomes: this.outcomes,
            situation: this.situation,
            stakeholders: this.stakeholders
        };
    }
}