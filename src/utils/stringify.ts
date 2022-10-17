/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint indent: 0 */

export default function stringify(fields: any) {
    return typeof fields === "string"
        ? fields
        : typeof fields?.join === "function"
        ? fields.join(",")
        : (fields as string | undefined);
}
