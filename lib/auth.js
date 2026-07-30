import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Generate access token
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify token — returns decoded payload or null
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Extract token from request headers
export function getTokenFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

// Middleware helper — use inside any API route
export async function authenticate(req) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return {
      success: false,
      status: 401,
      message: "No token provided. Please login.",
    };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      success: false,
      status: 401,
      message: "Invalid or expired token. Please login again.",
    };
  }

  return {
    success: true,
    user: decoded, // { id, email, roleId, ... }
  };
}

// Admin only middleware helper
export async function authenticateAdmin(req) {
  const auth = await authenticate(req);

  if (!auth.success) return auth;

  if (auth.user.role !== "admin") {
    return {
      success: false,
      status: 403,
      message: "Access denied. Admin only.",
    };
  }

  return auth;
}