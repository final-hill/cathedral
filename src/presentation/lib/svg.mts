type SvgAttributes<T extends keyof SVGElementTagNameMap> = Partial<SVGElementTagNameMap[T]>;

const create = <T extends keyof SVGElementTagNameMap>(
    tagName: T,
    objAttribs: SvgAttributes<T>,
    children: (SVGElement | string)[]
): SVGElementTagNameMap[T] => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);

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

type Children = string | SVGElement | (SVGElement | string)[];

type ElementMethods = {
    [K in keyof SVGElementTagNameMap]:
    ((objAttribs: SvgAttributes<K>, children: Children) => SVGElementTagNameMap[K])
    & ((children: Children) => SVGElementTagNameMap[K])
};

const isObjectLiteral = (obj: any) => {
    if (obj === null || typeof obj !== 'object')
        return false;
    return Object.getPrototypeOf(obj) === Object.prototype;
}

export default new Proxy({}, {
    get(_, prop: keyof SVGElementTagNameMap) {
        return (objAttribs: any, children: any) => {
            if (Array.isArray(children))
                return create(prop, objAttribs, children);
            else if (children != undefined)
                return create(prop, objAttribs, [children]);
            else if (Array.isArray(objAttribs))
                return create(prop, {}, objAttribs);
            else if (!isObjectLiteral(objAttribs))
                return create(prop, {}, [objAttribs]);
            else
                return create(prop, objAttribs, []);
        }
    },
}) as ElementMethods;