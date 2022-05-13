/* eslint-disable @typescript-eslint/no-explicit-any */
const objectId = (value: any, helpers: any) => {
    if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message("'{{#label}}' must be a valid mongo id");
    }
    return value;
};

export default objectId;
