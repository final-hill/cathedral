/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

// import { Contract, Contracted, invariant, implies } from '@final-hill/decorator-contracts';
import Project from './Project.mjs';
import Requirement from './Requirement.mjs';

// const artifactContract = new Contract<Artifact>({
//     [invariant]: self =>
//         // uptraceability: Every element of every artifact follows from some element of the requirements
//         implies(self.upTraceable, self.followsFrom != null) &&
//         implies(self.followsFrom != null, self.followsFrom?.project === self.project) // sameProject
// });

/**
 *
 */
// @Contracted(artifactContract)
export default class Artifact {
    private _upTraceable = false;
    get upTraceable(): boolean { return this._upTraceable; }
    set upTraceable(value: boolean) { this._upTraceable = value; }

    private _project?: Project;
    get project(): Project | undefined { return this._project; }
    set project(value: Project | undefined) { this._project = value; }

    private _followsFrom?: Requirement;
    get followsFrom(): Requirement | undefined { return this._followsFrom; }
    set followsFrom(value: Requirement | undefined) { this._followsFrom = value; }
}