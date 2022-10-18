import catchAsync from "../utils/catchAsync";
import hs from "http-status";
import { postServices } from "../services/";
import stringify from "../utils/stringify";
import ApiError from "../utils/apiError";

const getOne = catchAsync(async (req, res, next) => {
    /**
    const multipliers = Object.assign(
        {},
        ...Object.entries(
            pick(req.query, [
                "likesRatio",
                "savesRatio",
                "freshness",
                "trending",
                "readTimeScore",
                "relation",
            ])
        ).map(([key, value]) => {
            const obj: { [key: string]: number } = {};
            obj[key] = parseInt(stringify(value));
            return obj;
        })
    ); */
    const multipliers = {
        //more human-readable version of the commented-out code
        likesRatio: parseInt(stringify(req.query.likesRatio)),
        savesRatio: parseInt(stringify(req.query.savesRatio)),
        freshness: parseInt(stringify(req.query.freshness)),
        trending: parseInt(stringify(req.query.trending)),
        readTimeScore: parseInt(stringify(req.query.readTimeScore)),
        relation: parseInt(stringify(req.query.relation)),
    };
    const post = await postServices.getOne(
        req.params.id,
        stringify(req.query.fields),
        req.user,
        multipliers //for analytics
    );

    if (!post) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.OK).json({
        status: "OK",
        data: { post },
    });
});

const getMany = catchAsync(async (req, res, next) => {
    const posts = await postServices.getMany(req.query);

    res.status(hs.OK).json({
        status: "OK",
        data: { posts },
    });
});

const post = catchAsync(async (req, res, next) => {
    const postedPost = await postServices.post(req.body, req.user);

    res.status(hs.CREATED).json({
        status: "OK",
        data: { post: postedPost },
    });
});

const deleteOne = catchAsync(async (req, res, next) => {
    const post = await postServices.deleteOne(req.params.id, req.user);

    if (!post) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.NO_CONTENT).send();
});

const patch = catchAsync(async (req, res, next) => {
    const post = await postServices.patch(req.params.id, req.body, req.user);

    if (!post) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.OK).json({
        status: "OK",
        data: { post },
    });
});

const like = catchAsync(async (req, res, next) => {
    const post = await postServices.like(req.params.id, req.user);
    if (!post) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }
    res.status(hs.OK).json({
        status: "OK",
        data: { post },
    });
});

const save = catchAsync(async (req, res, next) => {
    const post = await postServices.save(req.params.id, req.user);
    if (!post) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }
    res.status(hs.OK).json({
        status: "OK",
        data: { post },
    });
});

const unlike = catchAsync(async (req, res, next) => {
    const post = await postServices.unlike(req.params.id, req.user);
    if (!post) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }
    res.status(hs.OK).json({
        status: "OK",
        data: { post },
    });
});

const unsave = catchAsync(async (req, res, next) => {
    const post = await postServices.unsave(req.params.id, req.user);
    if (!post) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }
    res.status(hs.OK).json({
        status: "OK",
        data: { post },
    });
});

const getLikes = catchAsync(async (req, res, next) => {
    const { likes } = await postServices.getLikes(req.params.id);
    if (likes !== 0 && !likes)
        return next(new ApiError("Not found", hs.NOT_FOUND));
    res.status(hs.OK).json({
        status: "OK",
        data: { likes },
    });
});

const getSaves = catchAsync(async (req, res, next) => {
    const { saves } = await postServices.getSaves(req.params.id);
    if (saves !== 0 && !saves)
        return next(new ApiError("Not found", hs.NOT_FOUND));
    res.status(hs.OK).json({
        status: "OK",
        data: { saves },
    });
});

const read = catchAsync(async (req, res, next) => {
    if (!req.user) return next(new ApiError("Not logged in", hs.UNAUTHORIZED));
    const readPost = await postServices.read(
        req.params.id,
        req.user,
        req.body.percent,
        req.body.duration,
        req.body.leftOff
    );
    res.status(hs.OK).json({
        status: "OK",
        data: { readPost },
    });
});

// const getFeed = catchAsync(async (req, res, next) => {
//     const posts = await postServices.getFeed(
//         req.user,
//         stringify(req.query.shown)
//     );
//     res.status(hs.OK).json({
//         status: "OK",
//         data: { posts },
//     });
// });

const getNewFeed = catchAsync(async (req, res, next) => {
    const posts = await postServices.getNewFeed(
        req.user,
        stringify(req.query.shown)
    );
    res.status(hs.OK).json({
        status: "OK",
        data: { posts },
    });
});

const getRestFeed = catchAsync(async (req, res, next) => {
    if (!req.user) return next(new ApiError("Please log in", hs.UNAUTHORIZED));
    const posts = await postServices.getRestFeed(
        req.user._id,
        stringify(req.query.shown)
    );
    res.status(hs.OK).json({
        status: "OK",
        data: { posts },
    });
});

const finishFeed = catchAsync(async (req, res, next) => {
    if (!req.user) return next(new ApiError("Please log in", hs.UNAUTHORIZED));
    await postServices.finishFeed(req.user._id as string);
    res.status(hs.NO_CONTENT).send();
});

const getRead = catchAsync(async (req, res, next) => {
    if (!req.user) return next(new ApiError("Not logged in", hs.UNAUTHORIZED));
    const readPost = await postServices.getRead(req.params.id, req.user._id);
    res.status(hs.OK).json({
        status: "OK",
        data: { readPost },
    });
});

export default {
    getOne,
    getMany,
    post,
    deleteOne,
    patch,
    like,
    save,
    unlike,
    unsave,
    getLikes,
    getSaves,
    read,
    getRead,
    getNewFeed,
    getRestFeed,
    finishFeed,
};
