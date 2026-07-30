export function handleLogout(dispatch, logoutAction, router) {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");


    document.cookie = "token=; path=/; max-age=0";
  // Clear Redux
  dispatch(logoutAction());

  // Redirect to login
  router.push("/login");
}