import { NextResponse } from "next/server";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(request: NextRequestWithAuth) {

        if (!request.nextauth.token && !request.nextUrl.pathname.startsWith("/login")
        ) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
    ],
};