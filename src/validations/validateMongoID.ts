/* eslint-disable @typescript-eslint/no-explicit-any */
const objectId = (value: string, helpers: any) => {
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
        return helpers.message("'{{#label}}' must be a valid mongo id");
    }
    return value;
};

export default objectId;
