/**
 * Zips two arrays together with a function.
 * @param xs The first array.
 * @param ys The second array.
 * @param f The function to zip the arrays with.
 * @returns An array of the merged values.
 */
export default <X, Y, Z>(xs: X[], ys: Y[], f: (x: X, y: Y) => Z) =>
    xs.map((x, i) => f(x, ys[i]));