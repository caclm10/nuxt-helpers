import type { User } from "~/types/models"
import type { FetchUserResponse } from "~/types/response";

export const useAuth = createGlobalState(
    () => {
        const { $authFetch } = useNuxtApp();

        const user = ref<User>();
        const status = ref<"initial" | "fetching" | "fetched">("initial")

        const isAuthStatusInitial = computed(() => status.value === "initial");
        const isAuthStatusFetching = computed(() => status.value === "fetching");
        const isAuthStatusFetched = computed(() => status.value === "fetched");

        function setUser(_user: User) {
            user.value = _user;
        }

        async function fetchUser() {
            status.value = "fetching";

            try {
                const res = await $authFetch<HttpResponse<FetchUserResponse>>("/api/auth/user");
                setUser(res.data!.user);

            } finally {
                status.value = "fetched";
            }
        }

        return {
            user,
            status,
            isAuthStatusInitial,
            isAuthStatusFetching,
            isAuthStatusFetched,
            fetchUser,
            setUser
        }
    }
)
