/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { UseCase } from '../../domain/common/UseCase';
import { Uuid } from '../../domain/values/Uuid';
import Project from '../../domain/entities/Project';
import { ProjectRepository } from '../repositories/ProjectRepository';

export class GetProjectUseCase extends UseCase<Uuid, Project | undefined> {
    private _repository: ProjectRepository;

    constructor(repository: ProjectRepository) {
        super();
        this._repository = repository;
    }

    override async execute(id: Uuid): Promise<Project | undefined> {
        return undefined; //this._repository.read(project => project.id.equals(id))[0];
    }
}