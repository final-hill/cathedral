/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import PanelPresentation from '../../../lib/agency/agents/panel/Presentation';
import type { AgentStyle } from '../../../lib/agency/AgentStyle';

class PagePresentation extends PanelPresentation {
    override get styleRules(): AgentStyle {
        return {
            ...super.styleRules,
            '.page': {
                color: 'var(--font-primary)'
            }
        };
    }
    constructor() {
        super();
        this.elRoot.classList.add('page');
    }
}

export default PagePresentation;