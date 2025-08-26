// import connectDB from "./database";
// import { ObjectId } from "mongodb";

// export async function getTokenDb(id: string): Promise<String | null> {
//     if (!id) {
//         console.error("Token not provided");
//         return null;
//     }
//     const db = await connectDB();
//     const collection = db?.connection.db?.collection("usuarios");
//     let idObject: ObjectId;
//     try {
//         idObject = new ObjectId(id);
//     } catch (error) {
//         console.error("Invalid ObjectId format:", error);
//         return null;
//     }
//     const user = await collection?.findOne({ _id: idObject });
//     if (user && user.token) {
//         return user.token;
//     }
//     return null;
// }