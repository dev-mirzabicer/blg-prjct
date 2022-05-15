/* eslint-disable @typescript-eslint/no-explicit-any */
export function exclude(
    obj: Record<any, any>,
    ...keys: string[]
): Record<any, any> {
    const result: Record<any, any> = {};
    Object.keys(obj).forEach((key) => {
        if (!keys.includes(key)) {
            result[key] = obj[key];
        }
    });
    return result;
}

export function excludeByObj(
    obj: Record<any, any>,
    otherObj: Record<any, any>
): Record<any, any> {
    const result: Record<any, any> = {};
    Object.keys(obj).forEach((key) => {
        if (!otherObj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
    });
    return result;
}
