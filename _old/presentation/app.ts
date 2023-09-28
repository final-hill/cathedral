/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import Application from '../lib/agency/agents/application/Control';
import TabPosition from '../lib/agency/agents/TabNavigator/TabPosition';
// import basic from './theme/basic';
import Home from './pages/Home';
import Projects from './pages/Projects';
import GlobalNav from './agents/GlobalNav/Control';

class Requix extends Application {
    override start() {
        super.start();

        this.title = 'Requix';

        const nav = new GlobalNav({
            selectedIndex: 0,
            tabPosition: TabPosition.Left
        });
        nav.appendChild(new Home());
        nav.appendChild(new Projects());
        //nav.appendChildren(home, projects);

        this.appendChild(nav);
    }
}

const app = new Requix();