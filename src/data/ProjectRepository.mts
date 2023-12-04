/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Project } from '~/domain/Project.mjs';
import { PEGSRepository } from './PEGSRepository.mjs';

export class ProjectRepository extends PEGSRepository<Project> {
    constructor() { super('projects', Project); }
}