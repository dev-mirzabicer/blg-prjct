import Healthcheck from "../models/healthcheck.model";
import AdvancedQuery from "../utils/advancedQuery";

const getOne = (id: string, fields = "-__v") => {
    return new AdvancedQuery(Healthcheck.findById(id), { fields })
        .limit()
        .query();
};

const getMany = (query: Record<string, string>) => {
    return new AdvancedQuery(Healthcheck.find(), query)
        .filter()
        .sort()
        .paginate()
        .query();
};

const post = (body: Record<string, unknown>) => {
    return Healthcheck.create(body);
};

const deleteOne = (id: string) => {
    return Healthcheck.findByIdAndDelete(id);
};

const patch = (id: string, body: Record<string, unknown>) => {
    return Healthcheck.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
    });
};

export default { getOne, getMany, post, deleteOne, patch };
