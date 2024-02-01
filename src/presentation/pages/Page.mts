import zipWith from '~/lib/zipWith.mjs';
import type { Properties } from '~/types/Properties.mjs';
import buttonTheme from '~/presentation/theme/buttonTheme.mjs';
import { Container } from '~components/index.mjs';
import type { Theme } from '~/types/Theme.mjs';

export default abstract class Page extends Container {
    static route = '{undefined}';

    urlParams;

    constructor(properties: Exclude<Partial<Properties<Page>>, 'urlParams'>) {
        super(properties);

        const url = new URL(location.href, document.location.origin),
            pattern = (this.constructor as typeof Page).route.split('/'),
            pathname = url.pathname.split('/');
        this.urlParams = Object.fromEntries(url.searchParams.entries());

        zipWith(pattern, pathname, (p, n) => {
            if (p.startsWith(':'))
                this.urlParams[p.slice(1)] = n;
        });

        const sheet = new CSSStyleSheet(),
            pageStyle = this._initPageStyle(),
            styleElement = document.createElement('style');

        styleElement.id = `${this.tagName}-style`;

        for (const [head, body] of Object.entries(pageStyle)) {
            const i = sheet.insertRule(`${head} {}`),
                // @ts-expect-error: TS doesn't know about the style property
                { style } = sheet.cssRules[i];
            for (const [property, value] of Object.entries(body))
                if (property.startsWith('--'))
                    style.setProperty(property, value);
                else
                    style[property] = value;

            styleElement.textContent += `${sheet.cssRules[i].cssText}\n`;
        }

        document.head.append(styleElement);
    }

    override get title() {
        return document.title;
    }
    override set title(value: string) {
        document.title = value;
        super.title = value;
    }

    connectedCallback() { }

    disconnectedCallback() {
        const styleElement = document.querySelector(`#${this.tagName}-style`);
        if (styleElement)
            styleElement.remove();
    }

    protected _initPageStyle(): Theme {
        return {
            ...buttonTheme
        };
    }
}