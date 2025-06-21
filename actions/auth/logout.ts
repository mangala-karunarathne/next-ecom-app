"use server";

import { fetchApiClient } from "@/lib/oneentry";
import { cookies } from "next/headers";

interface IErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  pageData: null;
}

export default async function logoutAction() {
  const cookieStore = cookies();
  const refreshTokenCookie = (await cookieStore).get("refresh_token")?.value;
  const accessTokenCookie = (await cookieStore).get("access_token")?.value;
  const apiClient = await fetchApiClient();

  if (!refreshTokenCookie || !accessTokenCookie) {
    return {
      message: "Yo are not currently logged in",
    };
  }

  try {
    const logoutResponse = await apiClient?.AuthProvider.setAccessToken(
      accessTokenCookie
    ).logout("email", refreshTokenCookie);

    if (typeof logoutResponse !== "boolean") {
      const errorResponse = logoutResponse as unknown as IErrorResponse;
      return {
        message: errorResponse.message,
      };
    }

    (await cookieStore).delete("access_token");
    (await cookieStore).delete("user_identifier");

    (await cookieStore).set("refresh_token", "", {
      maxAge: 0,
    });
    (await cookieStore).set("access_token", "", {
      maxAge: 0,
    });
    (await cookieStore).set("user_identifier", "", {
      maxAge: 0,
    });
    return { message: "You have been logged out successfully." };
  } catch (error) {
    console.error("Error during Logout ", error);
    throw new Error(
      "An error occurred while logging out. Please try again later."
    );
  }
}
