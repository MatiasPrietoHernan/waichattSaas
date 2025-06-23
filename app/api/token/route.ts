// app/api/get-token/route.ts
import { getTokenDb } from "@/lib/getToken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return new Response("Missing ID", { status: 400 });

  const token = await getTokenDb(id);
  console.log(token)
  return Response.json({ token });
}
