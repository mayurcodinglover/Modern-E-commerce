export function clearAuthCookie() {
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
}

export function handleLogout(dispatch, logoutAction, router) {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  clearAuthCookie();
  // Clear Redux
  dispatch(logoutAction());

  // Redirect to login
  router.push("/login");
}
