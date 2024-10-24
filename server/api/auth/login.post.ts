import { z } from "zod";
import { eq } from "drizzle-orm";

import { User } from "~/server/db/schema";

const schema = z.object({
    email: $zString("email").required().email().done(),
    password: $zString("password").required().min(6).max(20).done()
})

export default defineEventHandler(async (event) => {
    const result = await validateBody(event, schema)

    const users = await $db.select().from(User).where(eq(User.email, result.data.email))

    if (users.length === 0 || await hashCheck(result.data.password, users[0].password)) {
        throw new ValidationError({
            email: ["Theses credentials do not match our record."]
        });
    }

    const { accessToken, refreshToken } = await login(users[0])

    setCookie(event, "x-refresh-token", refreshToken, {
        httpOnly: true,
        secure: !import.meta.dev,
    })

    return defaultResponse("User logged in successfuly.", {
        data: {
            accessToken,
            user: userResource(users[0])
        }
    })
})
