export default (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
