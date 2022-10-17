/* eslint-disable @typescript-eslint/no-explicit-any */
import Healthcheck from "../models/healthcheck.model";
import AdvancedQuery from "../utils/advancedQuery";
import { Query as MongoQuery, Document } from "mongoose";

const getOne = (id: string, fields = "-__v"): MongoQuery<any, any> => {
    return new AdvancedQuery(Healthcheck.findById(id), { fields })
        .limit()
        .query();
};

const getMany = (query: Record<string, any>): MongoQuery<any, any> => {
    return new AdvancedQuery(Healthcheck.find(), query)
        .filter()
        .sort()
        .paginate()
        .limit()
        .query();
};

const post = (body: Record<string, unknown>): Promise<Document> => {
    return Healthcheck.create(body);
};

const deleteOne = (id: string): MongoQuery<any, any> => {
    return Healthcheck.findByIdAndDelete(id);
};

const patch = (
    id: string,
    body: Record<string, unknown>
): MongoQuery<any, any> => {
    return Healthcheck.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
    });
};

export default { getOne, getMany, post, deleteOne, patch };
