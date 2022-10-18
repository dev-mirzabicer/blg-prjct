import catchAsync from "../utils/catchAsync";
import hs from "http-status";
import { healthcheckServices } from "../services/";
import ApiError from "../utils/apiError";
import stringify from "../utils/stringify";

const getOne = catchAsync(async (req, res, next) => {
    const healthcheck = await healthcheckServices.getOne(
        req.params.id,
        stringify(req.query.fields)
    );

    if (!healthcheck) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.OK).json({
        status: "OK",
        data: { healthcheck },
    });
});

const getMany = catchAsync(async (req, res, next) => {
    // const validQueries = [
    //     "healthcheck",
    //     "page",
    //     "limit",
    //     "sort",
    //     "fields",
    //     "text",
    // ];

    // const query = pick(req.query, validQueries);

    const healthchecks = await healthcheckServices.getMany(req.query);

    res.status(hs.OK).json({
        status: "OK",
        data: { healthchecks },
    });
});

const post = catchAsync(async (req, res, next) => {
    const healthcheck = await healthcheckServices.post(req.body);

    res.status(hs.CREATED).json({
        status: "OK",
        data: { healthcheck },
    });
});

const deleteOne = catchAsync(async (req, res, next) => {
    const healthcheck = await healthcheckServices.deleteOne(req.params.id);

    if (!healthcheck) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.NO_CONTENT).send();
});

const patch = catchAsync(async (req, res, next) => {
    const healthcheck = await healthcheckServices.patch(
        req.params.id,
        req.body
    );

    if (!healthcheck) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.OK).json({
        status: "OK",
        data: { healthcheck },
    });
});

export default { getOne, getMany, post, deleteOne, patch };
