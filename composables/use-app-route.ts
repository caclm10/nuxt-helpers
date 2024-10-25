const PROTECTED_ROUTES = [
    "/todos"
]

export function useAppRoute() {
    const router = useRouter();

    const isProtectedRoute = computed(
        () => PROTECTED_ROUTES.includes(router.currentRoute.value.path)
    )

    return {
        isProtectedRoute
    }
}
