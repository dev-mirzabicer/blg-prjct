import {
    getModelForClass,
    prop,
    DocumentType,
    pre,
    Ref,
} from "@typegoose/typegoose";
import { UserRole, TagCat } from "../constants";
import bcrypt from "bcryptjs";
import { Post } from "./post.model";

interface PreferredThing {
    name: string;
    weight: number;
}

class ReadPost {
    @prop({ required: true, ref: () => Post, type: () => String })
    public post!: Ref<Post, string>;

    @prop({ required: true, min: 0, max: 100 })
    public readPercent!: number;

    @prop({ min: 0, max: 100 })
    public leftOff?: number;

    @prop({ required: true })
    public duration!: number;
}

class PreferredTag implements PreferredThing {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public weight!: number;
}

class PreferredCategory implements PreferredThing {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public weight!: number;
}

@pre<User>("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
})
class User {
    @prop({ required: true, unique: true, minlength: 4, maxlength: 20 })
    public username!: string;

    @prop({ required: true })
    public name!: string;

    @prop({ required: true, select: false, minlength: 8 })
    public password!: string;

    @prop({ required: true, unique: true })
    public email!: string;

    @prop({ default: false })
    public verifiedEmail!: boolean;

    @prop({ required: false })
    public avatar?: string;

    @prop({ default: new Map<string, PreferredTag>() })
    public preferredTags?: Map<string, PreferredTag>;

    @prop({ default: new Map<string, PreferredCategory>() })
    public preferredCategories?: Map<string, PreferredCategory>;

    @prop({ default: 0 })
    public totalTagWeight?: number;

    @prop({ default: 0 })
    public totalCatWeight?: number;

    @prop({ ref: () => Post, type: () => [String] })
    public savedPosts?: Ref<Post, string>[];

    @prop({ default: new Map<string, ReadPost>() })
    public readPosts?: Map<string, ReadPost>;

    @prop({ required: true, default: UserRole.USER, enum: UserRole })
    public role!: UserRole;

    public correctPassword(this: DocumentType<User>, password: string) {
        return bcrypt.compare(password, this.password);
    }

    public async preferTagOrCat(
        this: DocumentType<User>,
        tagOrCatVal: string, //tagOrCatVal: Tag's or Category's value
        tagOrCat: TagCat,
        weight: number,
        remove = false
    ) {
        let tc: Map<string, PreferredThing>; //tc: tag/category
        let totalWeight: number;
        if (tagOrCat === TagCat.TAG) {
            tc = this.preferredTags || new Map();
            totalWeight = this.totalTagWeight || 0;
        } else {
            tc = this.preferredCategories || new Map();
            totalWeight = this.totalCatWeight || 0;
        }
        const foundCat = tc.get(tagOrCat);
        if (!foundCat) {
            tc.set(tagOrCatVal, {
                name: tagOrCatVal,
                weight: remove ? 0 : weight,
            });
            totalWeight += remove ? 0 : weight;
        } else {
            foundCat.weight += remove ? -weight : weight;
            totalWeight += remove ? -weight : weight;
        }
        if (tagOrCat === TagCat.TAG) {
            this.preferredTags = tc;
            this.totalTagWeight = totalWeight;
        } else {
            this.preferredCategories = tc;
            this.totalCatWeight = totalWeight;
        }
        await this.save();
    }

    public async readPost(
        this: DocumentType<User>,
        postId: string,
        percent: number,
        duration: number,
        leftOff = 0
    ) {
        if (!this.readPosts) this.readPosts = new Map<string, ReadPost>();
        this.readPosts.set(postId, {
            post: postId,
            readPercent: percent,
            leftOff,
            duration,
        });
        await this.save();
    }

    public async addSave(this: DocumentType<User>, postId: string) {
        if (!this.savedPosts) this.savedPosts = [];
        if (this.savedPosts.includes(postId)) return;
        this.savedPosts.push(postId);
        await this.save();
    }

    public async deleteSave(this: DocumentType<User>, postId: string) {
        if (!this.savedPosts) return;
        this.savedPosts = this.savedPosts.filter((post) => {
            return (post as string) !== postId;
        });
        await this.save();
    }
}

const UserModel = getModelForClass(User);

export default UserModel;
export { User };
