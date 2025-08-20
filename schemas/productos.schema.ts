import { Schema } from "mongoose";

const schemaProducts = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    sales_price: { type: Number, required: false },
    category: { type: String, required: true },
    subcategory: { type: String, required: false }, 
    is_deleted: { type: Boolean, required: false, default: false }, 
    image_urls: { type: [String], required: false }, 
    stock: { type: Number, required: true },
}, { timestamps: true }); 

export default schemaProducts;