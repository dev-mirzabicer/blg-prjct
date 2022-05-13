/* eslint-disable @typescript-eslint/ban-types */
type InitializeType<T> = {} & {
    [K in keyof T]-?: string extends T[K]
        ? ""
        : number extends T[K]
        ? 0
        : boolean extends T[K]
        ? false
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Array<any> extends T[K]
        ? []
        : object extends T[K]
        ? {}
        : T[K];
};

function getPrototype<T>(t: T): InitializeType<T> {
    return t as InitializeType<T>;
}

export default getPrototype;
