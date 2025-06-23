import { Schema } from "mongoose";

const user = new Schema({
    token:{type: String, required: true},
    phone:{type: String, required: true},
    conversationId:{type: String, required: true},
    createdAt:{type: Date, default: Date.now},
})

export default user;
