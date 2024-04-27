export const createArray = (size: number) => {
    return Array.from({ length: size }, (_, i) => i);
};
export const isProActive = () => {
    // @ts-ignore
    return window.__is_tableberg_pro_active;
}