export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth();

  // We are not on the auth page and not authenticated
  if (to.path !== "/auth" && status.value === "unauthenticated") {
    return navigateTo(`/auth`);
  }

  // We are on the auth page and authenticated
  if (to.path === "/auth" && status.value === "authenticated") {
    return navigateTo("/");
  }
});
