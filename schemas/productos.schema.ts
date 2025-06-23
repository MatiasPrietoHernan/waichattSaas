import { Schema } from "mongoose";

const schemaProducts = new Schema({
    name:{type: String, required: true},
    description:{type: String, required: false},
    price:{type: Float16Array, required: true},
    salePrice:{type: Float16Array, required: false},
    category:{type: String, required: true},
    image:{type: String, required: true},
    stock:{type: Int16Array, required: true},
})

export default schemaProducts;
