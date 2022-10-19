import {
    DocumentType,
    getModelForClass,
    prop,
    PropType,
    Ref,
} from "@typegoose/typegoose";
import { Author } from "./author.model";
import { TagCat } from "../constants";

interface PreferringThing {
    name: string;
    weight: number;
}

class PreferringTag implements PreferringThing {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public weight!: number;
}

class PreferringCat implements PreferringThing {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public weight!: number;
}

class Post {
    @prop({ required: true })
    public title!: string;

    @prop({ required: true })
    public description!: string;

    @prop({ required: true })
    public content!: string;

    @prop({ required: true, ref: () => Author, type: () => String })
    public author!: Ref<Author, string>;

    @prop({ required: true, default: new Date() })
    public date!: Date;

    @prop({ type: () => [String], required: true, maxlength: 8 })
    public tags!: string[];

    @prop({ default: 1 })
    public likes?: number;

    @prop({ default: 1 })
    public saves?: number;

    @prop({ default: 1 })
    public views?: number;

    @prop({ default: 3 })
    public seen?: number;

    @prop(
        {
            default: new Map<string, PreferringTag>(),
            type: () => PreferringTag,
        },
        PropType.MAP
    )
    public preferredByTag?: Map<string, PreferringTag>;

    @prop(
        {
            default: new Map<string, PreferringCat>(),
            type: () => PreferringCat,
        },
        PropType.MAP
    )
    public preferredByCat?: Map<string, PreferringCat>;

    @prop({ default: 0 })
    public preferredByCatWeight?: number;

    @prop({ default: 0 })
    public preferredByTagWeight?: number;

    @prop({ type: () => [String], required: true, maxlength: 3 })
    public categories!: string[];

    @prop({ required: true })
    public image!: string;

    @prop({ default: 0 })
    public totalDurationRead?: number;

    public get maxDurationForScoring() {
        //(letter count / ((average read word in a minute)*average turkish word length))
        return this.content.length / (150 * 7);
    }

    public async addLike(this: DocumentType<Post>) {
        if (this.likes) {
            this.likes++;
        } else {
            this.likes = 1;
        }
        this.save();
    }

    public async addSave(this: DocumentType<Post>) {
        if (this.saves) {
            this.saves++;
        } else {
            this.saves = 1;
        }
        this.save();
    }

    public async deleteLike(this: DocumentType<Post>) {
        if (this.likes) {
            this.likes--;
        } else {
            this.likes = 0;
        }
        this.save();
    }

    public async deleteSave(this: DocumentType<Post>) {
        if (this.saves) {
            this.saves--;
        } else {
            this.saves = 0;
        }
        this.save();
    }

    public async addView(this: DocumentType<Post>) {
        if (this.views) {
            this.views++;
        } else {
            this.views = 1;
        }
        this.save();
    }

    public async addSeen(this: DocumentType<Post>) {
        if (this.seen) {
            this.seen++;
        } else {
            this.seen = 3;
        }
        this.save();
    }

    public async addPreferredBy(
        this: DocumentType<Post>,
        name: string,
        weight: number,
        tagOrCat: TagCat,
        remove = false
    ) {
        let tc: Map<string, PreferringThing>;
        let totalWeight;
        if (tagOrCat === TagCat.TAG) {
            tc = this.preferredByTag || new Map<string, PreferringTag>();
            totalWeight = this.preferredByTagWeight || 0;
        } else {
            tc = this.preferredByCat || new Map<string, PreferringCat>();
            totalWeight = this.preferredByCatWeight || 0;
        }
        const foundTagOrCat = tc.get(name);
        if (!foundTagOrCat) {
            tc.set(name, {
                name,
                weight: remove ? 0 : weight,
            });
            totalWeight += remove ? 0 : weight;
        } else {
            foundTagOrCat.weight += remove ? -weight : weight;
            totalWeight += remove ? -weight : weight;
        }
        if (tagOrCat === TagCat.TAG) {
            this.preferredByTag = tc;
            this.preferredByTagWeight = totalWeight;
        } else {
            this.preferredByCat = tc;
            this.preferredByCatWeight = totalWeight;
        }
        await this.save();
    }
}

const PostModel = getModelForClass(Post);

export default PostModel;

export { Post };
