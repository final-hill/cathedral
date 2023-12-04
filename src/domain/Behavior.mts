/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import type { Properties } from '~/types/Properties.mjs';
import { Requirement, type RequirementJson } from './Requirement.mjs';

export interface BehaviorJson extends RequirementJson { }

export class Behavior extends Requirement {
    static override fromJSON({ id, statement }: BehaviorJson): Behavior {
        return new Behavior({ id, statement });
    }

    constructor(options: Properties<Behavior>) {
        super(options);
    }
}