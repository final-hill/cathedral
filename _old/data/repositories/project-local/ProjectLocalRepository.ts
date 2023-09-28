/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import Project from '../../../domain/entities/Project';
import { ProjectRepository } from '../../../application/repositories/ProjectRepository';
import { ProjectLocal } from './ProjectLocal';
import { ProjectLocalMapper } from './ProjectLocalMapper';

const id = () => true;

export default class ProjectLocalRepository implements ProjectRepository {
    private _mapper = new ProjectLocalMapper();

    create(entity: Project): void {
        const projects = this.read(id);
        projects.push(entity);
        localStorage.setItem('projects', JSON.stringify(this._mapper.mapTo(entity)));
    }

    read(where: (entity: Project) => boolean): Project[] {
        const rawProjects: ProjectLocal[] = JSON.parse(localStorage.getItem('projects') ?? '[]');

        return rawProjects.map(this._mapper.mapFrom).filter(where);
    }

    update(where: (entity: Project) => boolean, action: (entity: Project) => Project): void {
        const newProjects = this.read(id)
            .map(project => where(project) ? action(project) : project);
        localStorage.setItem('projects', JSON.stringify(newProjects.map(this._mapper.mapTo)));
    }

    delete(where: (entity: Project) => boolean): void {
        const newProjects = this.read(id)
            .filter(project => !where(project));
        localStorage.setItem('projects', JSON.stringify(newProjects.map(this._mapper.mapTo)));
    }
}