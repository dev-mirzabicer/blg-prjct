import {
    getModelForClass,
    prop,
    DocumentType,
    pre,
    PropType,
} from "@typegoose/typegoose";
import { UserRole, TagCat } from "../constants";
import bcrypt from "bcryptjs";

interface PreferredThing {
    name: string;
    weight: number;
}

class ReadPost {
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

    @prop(
        { default: new Map<string, PreferredTag>(), type: () => PreferredTag },
        PropType.MAP
    )
    public preferredTags?: Map<string, PreferredTag>;

    @prop(
        {
            default: new Map<string, PreferredCategory>(),
            type: () => PreferredCategory,
        },
        PropType.MAP
    )
    public preferredCategories?: Map<string, PreferredCategory>;

    @prop(
        { default: new Map<string, boolean>(), type: () => Boolean },
        PropType.MAP
    )
    public likedPosts?: Map<string, boolean>;
    //since this will be queried a lot, and it will be relatively large (especially compared to savedPosts), I'm making it a map rather than a list

    @prop({ default: 0 })
    public totalTagWeight?: number;

    @prop({ default: 0 })
    public totalCatWeight?: number;

    @prop()
    public savedPosts?: string[];

    @prop(
        { default: new Map<string, ReadPost>(), type: () => ReadPost },
        PropType.MAP
    )
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
            readPercent: percent,
            leftOff,
            duration,
        });
        await this.save();
    }

    public async addSave(this: DocumentType<User>, postId: string) {
        if (!this.savedPosts) this.savedPosts = [];
        if (this.savedPosts.includes(postId)) return false;
        this.savedPosts.push(postId);
        await this.save();
        return true;
    }

    public async deleteSave(this: DocumentType<User>, postId: string) {
        if (!this.savedPosts) return false;
        const index = this.savedPosts?.indexOf(postId);
        if (index && index > -1) {
            this.savedPosts?.splice(index, 1);
        } else return false;
        await this.save();
        return true;
    }

    public async addLike(this: DocumentType<User>, postId: string) {
        if (!this.likedPosts) this.likedPosts = new Map<string, boolean>();
        if (this.likedPosts.get(postId)) return false;
        this.likedPosts.set(postId, true);
        await this.save();
        return true;
    }
    public async deleteLike(this: DocumentType<User>, postId: string) {
        if (!this.likedPosts) return false;
        if (!this.likedPosts.delete(postId)) return false;
        await this.save();
        return true;
    }
}

const UserModel = getModelForClass(User);

export default UserModel;
export { User };
