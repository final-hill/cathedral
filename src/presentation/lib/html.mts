export const renderIf = Symbol('renderIf');

export type HtmlAttributes<T extends keyof HTMLElementTagNameMap> =
    Partial<HTMLElementTagNameMap[T] & { [renderIf]: boolean }>;

const create = <T extends keyof HTMLElementTagNameMap>(tagName: T, objAttribs: HtmlAttributes<T>, children: Parameters<Element['append']>): HTMLElementTagNameMap[T] => {
    if (objAttribs[renderIf] === false)
        return document.createDocumentFragment() as any;

    const element = document.createElement(tagName);

    Object.entries(objAttribs).forEach(([attr, value]) => {
        if ((attr as any) === renderIf)
            return;

        if (attr in element) {
            if (attr === 'form')  // form is readonly
                element.setAttribute('form', (value as HTMLFormElement).getAttribute('id')!);
            else
                (element as any)[attr] = value;
        } else {
            element.setAttribute(attr, value);
        }
    });

    if (tagName === 'template')
        (element as HTMLTemplateElement).content.append(...children);
    else
        element.append(...children);

    return element;
};

type Children = string | Element | (Element | string)[];

type ElementMethods = {
    [K in keyof HTMLElementTagNameMap]:
    (() => HTMLElementTagNameMap[K])
    & ((objAttribs: HtmlAttributes<K>) => HTMLElementTagNameMap[K])
    & ((children: Children) => HTMLElementTagNameMap[K])
    & ((objAttribs: HtmlAttributes<K>, children: Children) => HTMLElementTagNameMap[K])
}

const isObjectLiteral = (obj: any): boolean => {
    if (obj === null || typeof obj !== 'object')
        return false;
    return Object.getPrototypeOf(obj) === Object.prototype;
}

const html = (new Proxy({}, {
    get<T extends keyof HTMLElementTagNameMap>(_: any, prop: T) {
        return (objAttribs: HtmlAttributes<T> | Children, children: Children) => {
            if (!objAttribs && !children) {
                return create(prop, {}, []);
            } else if (objAttribs && !children) {
                if (Array.isArray(objAttribs))
                    return create(prop, {}, objAttribs);
                else if (isObjectLiteral(objAttribs))
                    return create(prop, (objAttribs as HtmlAttributes<T>), []);
                else
                    return create(prop, {}, [(objAttribs as Element | string)]);
            } else if (objAttribs && children) {
                if (!isObjectLiteral(objAttribs))
                    throw new Error('Invalid arguments');
                if (Array.isArray(children))
                    return create(prop, (objAttribs as HtmlAttributes<T>), children);
                else
                    return create(prop, (objAttribs as HtmlAttributes<T>), [children]);
            } else {
                throw new Error('Invalid arguments');
            }
        }
    },
})) as ElementMethods;

export default html;