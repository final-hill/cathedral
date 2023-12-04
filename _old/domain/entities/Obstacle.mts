/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */


import Goal from './Goal.mjs';

export default class Obstacle extends Goal {
    override get isRelevant() { return true; }
}