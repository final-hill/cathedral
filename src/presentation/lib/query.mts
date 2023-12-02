export const qs = <E extends Element>(sel: string, ctx: Element = document.documentElement) =>
    ctx.querySelector<E>(sel)

export const qsa = <E extends Element>(sel: string, ctx: Element = document.documentElement) =>
    Array.from(ctx.querySelectorAll<E>(sel))