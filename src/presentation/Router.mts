// Utilizes the Navigation API to intercept navigation events and handle them
// As of 2023-11-01, the Navigation API is still experimental and supported
// by only Chromium-based browsers (~71% coverage)
// https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
// https://developer.chrome.com/docs/web-platform/navigation-api/
// https://caniuse.com/mdn-api_navigation
// Types are polyfilled via dom-navigation package
import { HandleEvent } from './HandleEvent.mjs';
import { NotFound } from './pages/NotFound.mjs';
import Page from './pages/Page.mjs';

export default class Router extends HandleEvent(EventTarget) {
    #routeTable: Map<string, typeof Page>;

    constructor(routes: [string, typeof Page][]) {
        super();
        this.#routeTable = new Map(routes);
        self.navigation.addEventListener('navigate', this);
    }

    addRoute(path: string, PageCons: typeof Page): void {
        this.#routeTable.set(path, PageCons);
    }

    onNavigate(event: NavigateEvent): void {
        if (!event.canIntercept || event.hashChange)
            return;

        const url = new URL(event.destination.url),
            // Page = this.#routeTable.get(url.pathname) ?? NotFound;

            // Search for a matching route pattern in the route table. Patterns
            // are of the form /:param1/:param2/:param3, where the colon
            // indicates a parameter.
            candidate = [...this.#routeTable.keys()].find(path => {
                const pattern = path.split('/'),
                    pathname = url.pathname.split('/');

                if (pattern.length !== pathname.length)
                    return false;

                return pattern.every((segment, index) => {
                    if (segment.startsWith(':'))
                        return true;

                    return segment === pathname[index];
                });
            }),
            Page = candidate ? this.#routeTable.get(candidate) : NotFound;

        event.intercept({
            handler: async () => {
                event.preventDefault();
                this.dispatchEvent(new CustomEvent('route', { detail: Page }));
            }
        });
    }

    async route(pathname: string): Promise<void> {
        await self.navigation.navigate(pathname).finished;
    }
}