// Get claims from JSON Web Token (JWT)
// JWT is signed on backend, sent with every request, and verified on backend
function tokenGetClaims(token: string) {
  if (!token) {
    return {};
  }

  const tokenArray = token.split(".");
  if (tokenArray.length !== 3) return {};

  return JSON.parse(window.atob(tokenArray[1].replace("-", "+").replace("_", "/")));
}

export function isAuthenticated(token: string | undefined): boolean {
  return !!token;
}

export function isTokenAdmin(token: string): boolean {
  return !!tokenGetClaims(token).admin;
}

export function isTokenSuperAdmin(token: string): boolean {
  return !!tokenGetClaims(token).superAdmin;
}

export function isTokenRegistered(token: string): boolean {
  return !!tokenGetClaims(token).registered;
}
