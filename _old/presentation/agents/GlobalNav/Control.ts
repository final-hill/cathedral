/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import TabNavigator from '../../../lib/agency/agents/TabNavigator/Control';
import GlobalNavPresentation from './Presentation';

class GlobalNav extends TabNavigator {
    override presentation = new GlobalNavPresentation();
}

export default GlobalNav;