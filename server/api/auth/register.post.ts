import { z } from "zod";

import { User } from "~/server/db/schema";

const schema = z.object({
    name: $zString("name").required().max(255).done(),
    email: $zString("email").required().email().done(),
    password: $zString("password").required().min(6).max(20).done()
})

export default defineRequestHandler(async (event) => {
    const validated = await validateBody(event, schema)

    const users = await $db.insert(User).values({
        name: validated.name,
        email: validated.email,
        password: await hash(validated.password)
    }).returning()

    const { accessToken, refreshToken } = await login(users[0])

    setCookie(event, "x-refresh-token", refreshToken, {
        httpOnly: true,
        secure: !import.meta.dev,
    })

    return defaultResponse("User registered successfuly.", {
        data: {
            accessToken,
            user: userResource(users[0])
        }
    })
})
