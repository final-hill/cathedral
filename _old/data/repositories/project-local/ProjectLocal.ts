/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

export class ProjectLocal {
    id!: string;
    //artifacts: Artifact[]
    downTraceable!: boolean;
    upTraceable!: boolean;
    //requirements: Requirement[]
    title!: string;

    constructor(params: ProjectLocal) {
        Object.assign(this, params);
    }
}