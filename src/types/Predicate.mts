/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

/**
 * A Predicate is an expression that evaluates to true or false in a given context.
 */
export type Predicate = (...args: any[]) => boolean;