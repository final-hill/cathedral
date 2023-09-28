/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { UseCase } from '../../domain/common/UseCase';
import Project from '../../domain/entities/Project';
import { ProjectRepository } from '../repositories/ProjectRepository';

export default class GetAllProjectsUseCase extends UseCase<void, Project[]> {
    private _repository: ProjectRepository;

    constructor(repository: ProjectRepository) {
        super();
        this._repository = repository;
    }

    override async execute(): Promise<Project[]> {
        return [];
    }
}