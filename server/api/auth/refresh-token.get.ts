import { eq } from "drizzle-orm";

import { UserSession } from "~/server/db/schema";

export default defineRequestHandler(async (event) => {
    const refreshToken = getCookie(event, "x-refresh-token")

    if (refreshToken) {
        const session = await $db.query.UserSession.findFirst({
            where: eq(UserSession.refreshToken, encrypter().decrypt(refreshToken)),
            with: {
                User: true
            }
        });

        if (session) {
            const accessToken = await generateAccessToken(session.User!.email);

            return defaultResponse("Token refreshed successfully.", {
                data: { accessToken }
            });
        }
    }

    throw new HttpError("Unauthorized", {
        statusCode: 401,
        code: responseCode.INVALID_REFRESH_TOKEN
    });
})
