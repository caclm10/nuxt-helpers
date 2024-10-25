export function useAsyncFn(): [(fn: <T = any>() => Promise<void | T>) => Promise<void>, Ref<boolean, boolean>] {
    const isProcessing = ref(false);

    async function exec(fn: <T = any>() => Promise<T | void>) {
        isProcessing.value = true;
        await fn().finally(() => isProcessing.value = false);
    }

    return [exec, isProcessing]
}
