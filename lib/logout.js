export function handleLogout(dispatch, logoutAction, router) {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Clear Redux
  dispatch(logoutAction());

  // Redirect to login
  router.push("/login");
}