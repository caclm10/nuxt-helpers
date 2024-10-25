import { eq } from "drizzle-orm";
import { User } from "~/server/db/schema";

export default defineRequestHandler(async (event) => {
    const { sub } = await getAccessTokenPayload(event);

    const user = await $db.query.User.findFirst({
        where: eq(User.nanoid, sub!)
    })

    return defaultResponse("User fetched successfully.", {
        data: {
            user: userResource(user)
        }
    })
})
