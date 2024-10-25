import { eq } from "drizzle-orm";

import { UserSession } from "~/server/db/schema";

export default defineRequestHandler(async (event) => {
    const { refreshToken } = getRefreshToken(event);

    if (refreshToken) {
        deleteCookie(event, "x-refresh-token");
        await $db.delete(UserSession).where(eq(UserSession.refreshToken, refreshToken));
    }

    return defaultResponse("User logged out successfuly.");
})
