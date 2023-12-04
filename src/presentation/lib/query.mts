/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
export const qs = <E extends Element>(sel: string, ctx: Element = document.documentElement) =>
    ctx.querySelector<E>(sel);

export const qsa = <E extends Element>(sel: string, ctx: Element = document.documentElement) =>
    Array.from(ctx.querySelectorAll<E>(sel));