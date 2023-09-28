/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import Panel from '../../../lib/agency/agents/panel/Control';
import PagePresentation from './Presentation';

class Page extends Panel {
    override presentation = new PagePresentation();
}

export default Page;