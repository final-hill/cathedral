/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import type Page from './pages/Page.mjs';
import Router from './Router.mjs';
import html from './lib/html.mjs';
import { Breadcrumb, Container, GlobalNav } from '~components/index.mjs';

export default class Application extends Container {
    static {
        customElements.define('x-application', this);
    }
    #currentPage: Page | null = null;
    #router!: Router;

    constructor() {
        super({}, []);

        this._installOrUpdateServiceWorker();
        this._initRouter().then(() => {
            self.navigation.navigate(location.pathname);
        });
    }

    protected override _initHtml() {
        const { template, section, slot } = html;

        return template([
            new GlobalNav({}),
            new Breadcrumb({}),
            section({ id: 'content' }, slot())
        ]);
    }

    protected override _initStyle() {
        return {
            ...super._initStyle(),
            ':host': {
                backgroundColor: 'var(--site-dark-bg)',
                color: 'var(--font-color)',
                display: 'grid',
                fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                gridTemplateColumns: 'fit-content(1.5in) 1fr',
                gridTemplateRows: '0.5in 1fr',
                gridTemplateAreas: '"global-nav breadcrumb" "global-nav content"',
                height: '100vh',
                lineHeight: '1.5',
                overflow: 'hidden',
                width: '100vw',
            },
            'x-global-nav': {
                gridArea: 'global-nav',
                height: '100vh',
            },
            'x-bread-crumb': {
                gridArea: 'breadcrumb',
            },
            '#content': {
                backgroundColor: 'var(--content-bg)',
                gridArea: 'content',
                overflow: 'auto',
                padding: '1em 2em',
            }
        };
    }

    protected async _initRouter() {
        this.#router = new Router([
            ['/', (await import('./pages/Home.mjs')).Home],
            ['/not-found', (await import('./pages/NotFound.mjs')).NotFound],
            ['/projects', (await import('./pages/projects/Projects.mjs')).Projects],
            ['/environments', (await import('./pages/environments/Environments.mjs')).Environments],
            ['/environments/new-entry', (await import('./pages/environments/NewEnvironment.mjs')).NewEnvironment],
            ['/environments/:slug', (await import('./pages/environments/Environment.mjs')).Environment],
            ['/environments/:slug/glossary', (await import('./pages/environments/Glossary.mjs')).Glossary],
            ['/goals', (await import('./pages/goals/Goals.mjs')).Goals],
            ['/goals/new-entry', (await import('./pages/goals/NewGoals.mjs')).NewGoals],
            ['/goals/:slug', (await import('./pages/goals/Goal.mjs')).Goal],
            ['/goals/:slug/rationale', (await import('./pages/goals/Rationale.mjs')).Rationale],
            ['/goals/:slug/functionality', (await import('./pages/goals/Functionality.mjs')).Functionality],
            ['/goals/:slug/stakeholders', (await import('./pages/goals/Stakeholders.mjs')).Stakeholders],
        ]);
        this.#router.addEventListener('route', this);
    }

    protected async _installServiceWorker() {
        try {
            const registration = await self.navigator.serviceWorker.register('/sw.mjs', { scope: '/' });
            if (registration.installing)
                this.dispatchEvent(new CustomEvent('installing', {
                    detail: 'Service worker installing'
                }));
            else if (registration.waiting)
                this.dispatchEvent(new CustomEvent('waiting', {
                    detail: 'Service worker waiting'
                }));
            else if (registration.active)
                this.dispatchEvent(new CustomEvent('active', {
                    detail: 'Service worker active'
                }));
        } catch (error) {
            this.dispatchEvent(new CustomEvent('error', {
                detail: 'Service worker registration failed'
            }));
        }
    }

    protected async _installOrUpdateServiceWorker() {
        if (!('serviceWorker' in navigator))
            this.dispatchEvent(new CustomEvent('error', {
                detail: 'Service worker not supported'
            }));
        else
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
                if (registration)
                    await registration.update();
                else
                    await this._installServiceWorker();
            } catch (err) {
                await this._installServiceWorker();
            }
    }

    onRoute(event: CustomEvent<typeof Page>) {
        const Cons = event.detail;
        this.#currentPage?.dispatchEvent(new Event('unload'));
        this.#currentPage = new Cons({}, []);
        this.shadowRoot.querySelector('slot')!.replaceChildren(this.#currentPage);
        this.#currentPage.dispatchEvent(new Event('load'));
    }
}