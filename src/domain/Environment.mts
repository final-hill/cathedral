/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import type { Uuid } from '~/types/Uuid.mjs';
import { PEGS, type PEGSJson } from './PEGS.mjs';
import type { Properties } from '~/types/Properties.mjs';

export interface EnvironmentJson extends PEGSJson {
    glossary: Uuid[];
}

/**
 * The set of entities (people, organizations, regulations, devices and other material objects, other systems)
 * external to the project or system but with the potential to affect it or be affected by it.
 *
 * An environment describes the application domain and external context in which a
 * system operates.
 */
class Environment extends PEGS {
    static override fromJSON({ description, id, name, glossary }: EnvironmentJson): Environment {
        return new Environment({ description, id, name, glossary });
    }

    glossary: Uuid[];

    constructor(options: Properties<Environment>) {
        super(options);
        this.glossary = options.glossary;
    }

    override toJSON(): EnvironmentJson {
        return {
            ...super.toJSON(),
            glossary: this.glossary
        };
    }
}

export { Environment };