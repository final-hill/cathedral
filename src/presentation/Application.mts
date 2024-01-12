import type Page from './pages/Page.mjs';
import NotFoundPage from './pages/NotFoundPage.mjs';
import html from './lib/html.mjs';
import { Breadcrumb, Container, GlobalNav } from '~components/index.mjs';

export default class Application extends Container {
    static {
        customElements.define('x-application', this);
    }
    #currentPage: Page | null = null;
    #pages!: typeof Page[];

    constructor() {
        super({}, []);

        document.body.innerHTML = '';
        this._installOrUpdateServiceWorker();
        this._initPages().then(() => self.navigation.navigate(location.href));
    }

    protected override _initShadowHtml() {
        const { template, section, slot } = html;

        return template([
            new GlobalNav({}),
            new Breadcrumb({}),
            section({ id: 'content' }, slot())
        ]);
    }

    protected override _initShadowStyle() {
        return {
            ...super._initShadowStyle(),
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

    protected async _initPages() {
        this.#pages = [
            (await import('./pages/HomePage.mjs')).default,
            NotFoundPage,
            (await import('./pages/solution/project/ProjectsIndexPage.mjs')).default,
            (await import('./pages/solution/environment/EnvironmentsIndexPage.mjs')).default,
            (await import('./pages/solution/environment/GlossaryPage.mjs')).default,
            (await import('./pages/solution/environment/ConstraintsPage.mjs')).default,
            (await import('./pages/solution/environment/InvariantsPage.mjs')).default,
            (await import('./pages/solution/goals/GoalsIndexPage.mjs')).default,
            (await import('./pages/solution/goals/RationalePage.mjs')).default,
            (await import('./pages/solution/goals/FunctionalityPage.mjs')).default,
            (await import('./pages/solution/goals/StakeholdersPage.mjs')).default,
            (await import('./pages/solution/goals/UseCasesPage.mjs')).default,
            (await import('./pages/solution/goals/LimitationsPage.mjs')).default,
            (await import('./pages/solution/NewSolutionPage.mjs')).default,
            (await import('./pages/solution/SolutionIndexPage.mjs')).default,
            (await import('./pages/solution/SolutionPage.mjs')).default
        ];

        self.navigation.addEventListener('navigate', this);
        this.addEventListener('route', this);
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

    onNavigate(event: NavigateEvent): void {
        if (!event.canIntercept || event.hashChange)
            return;

        const origin = document.location.origin,
            url = new URL(event.destination.url, origin),
            Page = this.#pages.find(Page => {
                const route = Page.route,
                    pattern = route.split('/'),
                    pathname = url.pathname.split('/');

                if (pattern.length !== pathname.length)
                    return false;

                return pattern.every((segment, index) => {
                    if (segment.startsWith(':'))
                        return true;

                    return segment === pathname[index];
                });
            }) ?? NotFoundPage;
        event.intercept({
            handler: async () => {
                event.preventDefault();
                this.dispatchEvent(new CustomEvent('route', { detail: Page }));
            }
        });
    }

    onRoute(event: CustomEvent<typeof Page>) {
        const Cons = event.detail;
        this.#currentPage = new Cons({}, []);
        this.replaceChildren(this.#currentPage);
    }
}