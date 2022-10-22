/* eslint-disable @typescript-eslint/no-explicit-any */
import AdvancedQuery from "../utils/advancedQuery";
import PostModel, { Post } from "../models/post.model";
import { Document } from "mongoose";
import UserModel, { User } from "../models/user.model";
import { DocumentType } from "@typegoose/typegoose/lib/types";
import ApiError from "../utils/apiError";
import httpStatus from "http-status";
import dayjs from "dayjs";
import { TagCat } from "../constants";
import AnalyticsModel from "../models/analytics.model";
import dfd from "danfojs-node";
import log from "../utils/logger";
import { redisCli } from "../";

type Multipliers = {
    likesRatio: number;
    savesRatio: number;
    freshness: number;
    trending: number;
    readTimeScore: number;
    relation?: number;
};

const prefer = (
    user: DocumentType<User>,
    post: DocumentType<Post>,
    multiplier: number,
    remove = false
) => {
    user.preferredTags?.forEach(async (tag) => {
        await post.addPreferredBy(
            tag.name,
            tag.weight * multiplier,
            TagCat.TAG,
            remove
        );
    });
    user.preferredCategories?.forEach(async (cat) => {
        await post.addPreferredBy(
            cat.name,
            cat.weight * multiplier,
            TagCat.CAT,
            remove
        );
    });
    post.tags.forEach(async (tag) => {
        await user.preferTagOrCat(tag, TagCat.TAG, multiplier, remove);
    });
    post.categories.forEach(async (cat) => {
        await user.preferTagOrCat(cat, TagCat.CAT, multiplier, remove);
    });
};

const calculateFreshness = (x: number) => {
    // eslint-disable-next-line prettier/prettier
    return 0.05 + 1 / (2 * Math.log10(x / 120 + 1.1)) / 20;
};

const viewTrending = (view: number, seen: number) => {
    return Math.pow(view, 23 / 20) / Math.pow(seen, 20 / 21);
};

const calculateRelation = (
    user: DocumentType<User>,
    post: DocumentType<Post>
) => {
    let rawTagRelation = 0;
    let pbTagRelation = 0;
    user.preferredTags?.forEach((tag) => {
        const postTag = post.tags.find((pt) => pt == tag.name);
        if (postTag && user.totalTagWeight)
            rawTagRelation += tag.weight / user.totalTagWeight;
        const postPbTag = post.preferredByTag?.get(tag.name);
        if (postPbTag && post.preferredByTagWeight && user.totalTagWeight)
            pbTagRelation +=
                (postPbTag.weight / post.preferredByTagWeight) *
                (tag.weight / user.totalTagWeight);
    });
    return rawTagRelation * pbTagRelation;
};

const addAnalytics = async (
    analyticsData: { multipliers: Multipliers; clicked: boolean },
    userId: string | undefined, //probably won't need the user but saving just in case for the future
    postId: string //need the post to effectively change the clicked situation if the user clicks
) => {
    if (analyticsData.multipliers.relation === 1)
        analyticsData.multipliers.relation = undefined;
    //if the user is not signed in and they rejected the necessary cookies,
    // then the relation will be undefined and will be set to the mean of the other data in the AI code.
    const existingAnalytics = await AnalyticsModel.findOne({
        post: postId,
        user: userId,
    });
    if (!existingAnalytics)
        await AnalyticsModel.create({
            ...analyticsData,
            user: userId,
            postId,
        });
    else {
        await existingAnalytics.update(analyticsData);
    }
};

const getOne = async (
    id: string,
    fields = "-__v",
    user: DocumentType<User> | undefined = undefined,
    multipliers: Multipliers | undefined = undefined
) => {
    const post: DocumentType<Post> = await new AdvancedQuery(
        PostModel.findById(id),
        { fields }
    )
        .limit()
        .query();
    if (!post) throw new ApiError("No post found", httpStatus.NOT_FOUND);
    if (!user?.readPosts?.get(id)) await post.addView();
    if (user) {
        await user.readPost(post._id, 1, 1, 0);
        prefer(user, post, 1);
    }
    if (multipliers) {
        await addAnalytics({ multipliers, clicked: true }, user?._id, id);
    }
    return post;
};

const read = async (
    id: string,
    user: DocumentType<User>,
    percent: number,
    duration: number,
    leftOff: number | undefined
) => {
    const post = await PostModel.findById(id);
    if (!post) throw new ApiError("No post found", httpStatus.NOT_FOUND);
    const readPost = user.readPosts?.get(id);
    prefer(user, post, (percent - (readPost?.readPercent || 0)) / 100);

    if (duration > post.maxDurationForScoring)
        duration = post.maxDurationForScoring;
    if (post.totalDurationRead)
        post.totalDurationRead += duration - (readPost?.duration || 0);
    prefer(user, post, (3 * duration) / post.maxDurationForScoring);
    await user.readPost(id, percent, duration, leftOff);
    await post.save();
    return readPost;
};

const getRead = async (postId: string, userId: string) => {
    const user = await UserModel.findById(userId);
    const postRead = user?.readPosts?.get(postId);
    if (!postRead || !user)
        throw new ApiError("Not found", httpStatus.NOT_FOUND);
    return postRead;
};

const getMany = async (query: Record<string, any>) => {
    const posts: DocumentType<Post>[] = await new AdvancedQuery(
        PostModel.find().select("-content"),
        query
    )
        .filter()
        .sort()
        .paginate()
        .limit()
        .query();
    // posts.forEach(async (post) => {
    //     await post.addSeen();
    // });
    return posts;
};

const getNewFeed = async (
    user: DocumentType<User> | undefined | null,
    shown: number
) => {
    // const postsWithMultiplr: {
    //     post: DocumentType<Post>;
    //     multipliers: Multipliers;
    // }[] = [];
    const columns = [
        "likesRatio",
        "savesRatio",
        "freshness",
        "trending",
        "readTimeScore",
        "relation",
    ];
    const postsDf = new dfd.DataFrame([], { columns });
    for await (const post of PostModel.find().select("-content")) {
        const likesRatio =
            Math.pow(post.likes || 1, 1 / 2) /
            Math.pow(post.views || 100, 1 / 3);
        const savesRatio =
            Math.pow(post.saves || 1, 1 / 2) /
            Math.pow(post.views || 100, 1 / 3);
        const hours = (dayjs().unix() - dayjs(post.date).unix()) / (60 * 60);
        const freshness = calculateFreshness(hours || 1) * 10;
        const trending = viewTrending(post.views || 1, post.seen || 100) / 3;
        const readTimeScore =
            (post.totalDurationRead || 1) /
            (post.maxDurationForScoring * (post.views || 1));
        const relation = user ? calculateRelation(user, post) * 30 : 1;
        // const weight =
        //     likesRatio * savesRatio * freshness * trending * relation;
        const multipliers = [
            likesRatio,
            savesRatio,
            freshness,
            trending,
            readTimeScore,
            relation,
        ];
        // postsWithMultiplr.push({
        //     post,
        //     // weight,
        //     multipliers,
        // });
        postsDf.append(multipliers, post._id, { inplace: true });
        //----
        //hKpxas92JDIlkca$kas
        // post.addSeen();
        // await addAnalytics(
        //     { multipliers, clicked: false },
        //     user?._id,
        //     post._id
        // );
    }
    const scaler = new dfd.StandardScaler();
    scaler.fitTransform(postsDf);
    const weights = postsDf.apply(
        (cell: Array<number>) => {
            return cell.reduce((a: number, b: number) => a * b, 1);
        },
        { axis: 1 }
    ) as dfd.Series;
    postsDf.addColumn("weight", weights, { inplace: true });
    postsDf.sortValues("weight", { inplace: true, ascending: false });
    const nextPostIds = postsDf.index.slice(
        shown,
        postsDf.index.length
    ) as string[];
    const shownPosts = postsDf.iloc({ rows: [`0:${shown}`] });
    const shownPostIds = shownPosts.index;
    const shownPostsList: DocumentType<Post>[] = [];
    for (const postId of shownPostIds) {
        const wPost = await PostModel.findById(postId);
        wPost?.addSeen();
        const multipliers: Multipliers = {
            likesRatio: shownPosts.at(postId, "likesRatio") as number,
            savesRatio: shownPosts.at(postId, "savesRatio") as number,
            freshness: shownPosts.at(postId, "freshness") as number,
            trending: shownPosts.at(postId, "trending") as number,
            readTimeScore: shownPosts.at(postId, "readTimeScore") as number,
            relation: shownPosts.at(postId, "likesRatio") as number,
        };
        const post = await PostModel.findById(postId).select(
            "title description author date tags categories likes saves image"
        );
        if (!post) {
            const err = new Error("Something went wrong");
            log("error", "Internal error at post.services", err);
            throw err;
        }
        shownPostsList.push(post);
        await addAnalytics(
            { multipliers, clicked: false },
            user?._id,
            postId as string
        );
    }
    if (user) {
        await redisCli?.del(user._id as string);
        nextPostIds.forEach(async (postId) => {
            const multipliers: Multipliers = {
                likesRatio: postsDf.at(postId, "likesRatio") as number,
                savesRatio: postsDf.at(postId, "savesRatio") as number,
                freshness: postsDf.at(postId, "freshness") as number,
                trending: postsDf.at(postId, "trending") as number,
                readTimeScore: postsDf.at(postId, "readTimeScore") as number,
                relation: postsDf.at(postId, "likesRatio") as number,
            };
            const postToBePushed = {
                ...multipliers,
                postId,
            };
            await redisCli?.rPush(
                user._id as string,
                JSON.stringify(postToBePushed)
            );
        });
    }
    return shownPostsList;
};

const getRestFeed = async (userId: string, shown: number) => {
    const postsStr = await redisCli?.lPopCount(userId, shown);
    if (!postsStr) return [];
    const postDocs: DocumentType<Post>[] = [];
    const posts: {
        likesRatio: number;
        savesRatio: number;
        freshness: number;
        trending: number;
        readTimeScore: number;
        relation: number;
        postId: string;
    }[] = postsStr.map((postStr) => JSON.parse(postStr));
    for (const post of posts) {
        const {
            likesRatio,
            savesRatio,
            freshness,
            trending,
            readTimeScore,
            relation,
        } = post;
        const multipliers = {
            likesRatio,
            savesRatio,
            freshness,
            trending,
            readTimeScore,
            relation,
        };
        const postDoc = await PostModel.findById(post.postId).select(
            "title description author date tags categories likes saves image"
        );
        if (!postDoc) continue; //TODO this may create problems, check it out if you have errors
        await addAnalytics(
            { multipliers, clicked: false },
            userId,
            post.postId
        );
        postDocs.push(postDoc);
    }
    return postDocs;
};

const finishFeed = async (userId: string) => {
    await redisCli?.del(userId);
};

// const seeFeed = (
//     posts: string[],
//     user: DocumentType<User> | undefined,
//     multipliers: Multipliers
// ) => {
//     posts.forEach(async (post) => {
//         const foundPost = await PostModel.findById(post);
//         if (!foundPost) return;
//         await foundPost.addSeen();
//         await addAnalytics(
//             { multipliers, clicked: false },
//             user?._id,
//             foundPost._id
//         );
//     });
// };

const post = (
    body: Record<string, unknown>,
    user: DocumentType<User> | undefined | null
): Promise<Document> => {
    body.author = user?._id;
    return PostModel.create(body);
};

const deleteOne = async (
    id: string,
    user: DocumentType<User> | undefined | null
) => {
    const post = await PostModel.findById(id);
    if (!post || post.author != user?._id) {
        throw new ApiError(
            "No such post found within user's posts",
            httpStatus.NOT_FOUND
        );
    }
    return post.remove();
};

const patch = async (
    id: string,
    body: Record<string, unknown>,
    user: DocumentType<User> | undefined | null
) => {
    const post = await PostModel.findById(id);
    if (!post || post.author != user?._id) {
        throw new ApiError(
            "No such post found within user's posts",
            httpStatus.NOT_FOUND
        );
    }
    await post.update(body, {
        runValidators: true,
    });
    Object.assign(post, body);
    return post;
};

const like = async (id: string, user: DocumentType<User> | undefined) => {
    if (!user) throw new ApiError("Not logged in", httpStatus.UNAUTHORIZED);
    const foundPost = await PostModel.findById(id);
    if (!user || !foundPost)
        throw new ApiError("No post or user found", httpStatus.NOT_FOUND);
    if (await user.addLike(id)) {
        await foundPost.addLike();
        prefer(user, foundPost, 1);
    }
    return foundPost;
};

const save = async (id: string, user: DocumentType<User> | undefined) => {
    if (!user) throw new ApiError("Not logged in", httpStatus.UNAUTHORIZED);
    // const foundUser = await UserModel.findById(user._id);
    const foundPost = await PostModel.findById(id);
    if (!user || !foundPost)
        throw new ApiError("No post or user found", httpStatus.NOT_FOUND);
    (await user.addSave(foundPost._id)) && (await foundPost.addSave());
    return foundPost;
};

const unlike = async (id: string, user: DocumentType<User> | undefined) => {
    if (!user) throw new ApiError("Not logged in", httpStatus.UNAUTHORIZED);
    const foundPost = await PostModel.findById(id);
    if (!user || !foundPost)
        throw new ApiError("No post or user found", httpStatus.NOT_FOUND);
    if (await user.deleteLike(foundPost._id)) {
        await foundPost.deleteLike();
        prefer(user, foundPost, 1, true);
    }
    return foundPost;
};

const unsave = async (id: string, user: DocumentType<User> | undefined) => {
    if (!user) throw new ApiError("Not logged in", httpStatus.UNAUTHORIZED);
    const foundPost = await PostModel.findById(id);
    if (!user || !foundPost)
        throw new ApiError("No post or user found", httpStatus.NOT_FOUND);
    (await user.deleteSave(foundPost._id)) && (await foundPost.deleteSave());
    return foundPost;
};

const getLikes = async (id: string) => {
    return getOne(id, "likes");
};

const getSaves = async (id: string) => {
    return getOne(id, "saves");
};

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
