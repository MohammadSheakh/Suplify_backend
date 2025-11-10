//@ts-ignore
import mongoose from "mongoose";

export function toObjectId(id: string | undefined | null): mongoose.Types.ObjectId {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId: ${id}`);
    }
    return new mongoose.Types.ObjectId(id);
}