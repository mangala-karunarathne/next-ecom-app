"use server";

import { cookies } from "next/headers";

export default async function storeRefreshToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("refresh_token", token);
}
