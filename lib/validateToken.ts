// import { verify } from "jsonwebtoken";
// import connectDB from "./database";
// import { ObjectId } from "mongodb";

// export async function validateToken(id: string): Promise<boolean> {
//     if (!id) {
//         console.error("Token not provided");
//         return false;
//     }
//     const db = await connectDB();
//     const collection = db?.connection.db?.collection("usuarios");
//     const idObject = new ObjectId(id);
//     const user = await collection?.findOne({ _id: idObject });
//     const secretKey = process.env.NEXTAUTH_SECRET ?? "";
//     if (user && user.token) {
//         try {
//             const decode=verify(user.token, secretKey);
//             return true
//         } catch (error: any) {
//             console.error("Token verification error:", error.message);
//             return false;
//         }

//     }
//     return false;
//}