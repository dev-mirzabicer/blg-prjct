import Joi from "joi";

interface Validation {
    getOne: Record<string, Joi.ObjectSchema>;
    getMany: Record<string, Joi.ObjectSchema>;
    post: Record<string, Joi.ObjectSchema>;
    deleteOne: Record<string, Joi.ObjectSchema>;
    patch: Record<string, Joi.ObjectSchema>;
}

export default Validation;
