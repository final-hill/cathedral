/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { Uuid } from '../values/Uuid';
import Artifact from './Artifact';
import Requirement from './Requirement';
import field from '../common/field';

/*
const projectContract = new Contract<ProjectType>({
    [invariant]: self =>
        self.requirements.every(req => req.project === self) &&
        self.artifacts.every(art => art.upTraceable) && // upTraceability
        // downTraceability: For every requirement at least one artifact follows from it.
        self.requirements.every(req => self.artifacts.some(art => art.followsFrom === req))
});
*/

/**
 * The set of human processes involved in the planning,
 * construction, revision, and operation of a system.
 * Associated with a single system.
 */
export default class Project {
    @field artifacts!: Artifact[];
    @field downTraceable!: boolean;
    @field id!: Uuid;
    @field requirements!: Requirement[];
    @field title!: string;
    @field upTraceable!: boolean;

    constructor(params: Project) {
        Object.assign(this, params);
    }
}
