import type { RegisterResponseData } from "~/types/response";

export default defineNuxtPlugin((nuxtApp) => {
    const { isProtectedRoute } = useAppRoute();
    const accessToken = useSessionStorage("access-token", "");

    const _authFetch = $fetch.create({
        baseURL: import.meta.env.baseURL,
        onRequest({ options }) {
            if (accessToken.value) {
                options.headers.set("Authorization", `Bearer ${accessToken.value}`)
            }
        },
        async onResponseError({ response }) {
            if (response.status === 401 && response._data?.code === responseCode.JWT_EXPIRED) {
                try {
                    const res = await $fetch<HttpResponse<RegisterResponseData>>("/api/auth/refresh-token");
                    accessToken.value = res.data!.accessToken;
                } catch (error) {
                    if (isProtectedRoute.value) {
                        await nuxtApp.runWithContext(() => navigateTo("/login"));
                    }

                    throw error;
                }
            } else {
                if (isProtectedRoute.value) {
                    await nuxtApp.runWithContext(() => navigateTo("/login"));
                }
            }
        }
    })

    type AuthFetch = Parameters<typeof _authFetch>;
    async function authFetch<D>(request: AuthFetch["0"], options?: AuthFetch["1"]) {
        try {
            return await _authFetch<D>(request, options);
        } catch (error) {
            if (isHttpError(error) && error.data.code === responseCode.JWT_EXPIRED) {
                return await authFetch(request, options);
            } else {
                throw error;
            }
        }
    }

    return {
        provide: {
            authFetch
        }
    }
})  
