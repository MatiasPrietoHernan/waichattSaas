import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: { authorized: ({ token }) => !!token && (token as any).role === "admin" },
});

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
