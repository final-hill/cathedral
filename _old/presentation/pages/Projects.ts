/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import TextSpan from '../../lib/agency/agents/text-span/Control';
import FeatherIconName from '../../lib/agency/feather-icon/FeatherIconName';
import Page from '../agents/Page/Control';

export default class Projects extends Page {
    override onAttached() {
        this.title = this.navLabel = 'Projects';
        this.navIcon = FeatherIconName.briefcase;
        this.appendChild(new TextSpan({ text: 'PROJECTS' }));
        super.onAttached();
    }
}