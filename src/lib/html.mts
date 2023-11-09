/*!
 * @license
 * Copyright (C) 2023 Michael L Haufe
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

type HtmlAttributes<T extends keyof HTMLElementTagNameMap> = Partial<HTMLElementTagNameMap[T]>;

const create = <T extends keyof HTMLElementTagNameMap>(
    tagName: T,
    objAttribs: HtmlAttributes<T>,
    children: (Element | string)[]
): HTMLElementTagNameMap[T] => {
    const element = document.createElement(tagName);

    Object.entries(objAttribs).forEach(([attr, value]) => {
        if (Object.prototype.hasOwnProperty.call(objAttribs, attr))
            // Ensure that the attribute exists on the element
            if (attr in element)
                (element as any)[attr] = value;
            else
                // If the attribute does not exist, set it as a standard attributes
                element.setAttribute(attr, value);
    });

    children.forEach(child => {
        element.appendChild(
            typeof child === 'string'
                ? document.createTextNode(child)
                : child
        );
    });

    return element;
};

type Children = string | Element | (Element | string)[];

type ElementMethods = {
    [K in keyof HTMLElementTagNameMap]:
    ((objAttribs: HtmlAttributes<K>, children: Children) => HTMLElementTagNameMap[K])
    & ((objAttribs: HtmlAttributes<K>) => HTMLElementTagNameMap[K])
    & ((children: Children) => HTMLElementTagNameMap[K])
    & (() => HTMLElementTagNameMap[K])
};

const isObjectLiteral = (obj: any) => {
    if (obj === null || typeof obj !== 'object')
        return false;
    return Object.getPrototypeOf(obj) === Object.prototype;
}

export default new Proxy({}, {
    get(_: any, prop: keyof HTMLElementTagNameMap) {
        type Children = string | Element | (Element | string)[] | undefined;

        return (objAttribs: HtmlAttributes<any> | Children, children: Children) => {
            if (!objAttribs && !children) {
                return create(prop, {}, []);
            } else if (objAttribs && !children) {
                if (Array.isArray(objAttribs))
                    return create(prop, {}, objAttribs);
                else if (isObjectLiteral(objAttribs))
                    return create(prop, objAttribs, []);
                else
                    return create(prop, {}, [objAttribs as Element | string]);
            } else if (objAttribs && children) {
                if (!isObjectLiteral(objAttribs))
                    throw new Error('Invalid arguments');
                if (Array.isArray(children))
                    return create(prop, objAttribs, children);
                else
                    return create(prop, objAttribs, [children]);
            } else {
                throw new Error('Invalid arguments');
            }
        }
    },
}) as ElementMethods;