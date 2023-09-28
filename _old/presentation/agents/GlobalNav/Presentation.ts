/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import TabNavigatorPresentation from '../../../lib/agency/agents/TabNavigator/Presentation';
import type { AgentStyle } from '../../../lib/agency/AgentStyle';

class GlobalNavPresentation extends TabNavigatorPresentation {
    constructor() {
        super();
        this.elRoot.classList.add('global-nav');
    }
    override get styleRules(): AgentStyle {
        return {
            ...super.styleRules,
            '.global-nav': {
                background: 'linear-gradient(to right, var(--palette1), var(--palette1), var(--palette1-1))',
                borderRight: '1px outset',
                height: '100%'
            },
            '.global-nav .tab': {
                color: 'var(--font-primary)',
                height: '0.5in',
                lineHeight: '0.5in',
                paddingLeft: '0.2in',
                textDecoration: 'none'
            }
        };
    }
}

export default GlobalNavPresentation;