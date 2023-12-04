/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */


import Requirement from './Requirement.mjs';

/**
 * A set of related artifacts, devised to help meet certain goals.
 */
export default class System {
    private _requirements: Requirement[] = [];
    get requirements(): Requirement[] { return this._requirements; }
}