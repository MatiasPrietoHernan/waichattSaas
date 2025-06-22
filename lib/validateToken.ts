import { verify } from "jsonwebtoken";

export function validateToken(token: string): boolean {

    const secretKey = process.env.NEXTAUTH_SECRET ?? "";
    if (!token) {
        console.error("Token not provided");
        return false;
    }
    try {
        verify(token, secretKey);
        return true
    } catch (error: any) {
        console.error("Token verification error:", error.message);
        return false;
    }
}