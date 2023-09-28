/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { ProjectLocal } from './ProjectLocal';
import Project from '../../../domain/entities/Project';
import { Mapper } from '../../../domain/common/Mapper';
import { Uuid } from '../../../domain/values/Uuid';

export class ProjectLocalMapper extends Mapper<ProjectLocal, Project> {
    mapFrom(param: ProjectLocal): Project {
        return new Project({
            artifacts: [],
            downTraceable: param.downTraceable,
            id: new Uuid(param.id),
            requirements: [],
            title: param.title,
            upTraceable: param.upTraceable
        });
    }
    mapTo(param: Project): ProjectLocal {
        return new ProjectLocal({
            id: param.id.toString(),
            downTraceable: param.downTraceable,
            title: param.title,
            upTraceable: param.upTraceable
        });
    }
}