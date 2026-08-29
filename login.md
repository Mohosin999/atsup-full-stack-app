# Login/Logout Cookie Fix - Production (Vercel) e Cookie Kaj Na Korar Solution

## Problem

Login/Logout **localhost** e perfect kaj kore, but **production (Vercel)** e kaj kore na.

**Karon:** Backend ar frontend Vercel e **different domain** e deploy ache. Cookie backend er domain e set hoy, tai frontend theke request korle browser cookie pathay na.

**Solution:** Vercel Proxy/Rewrite use kore frontend + backend ke **same-origin** baniyechi.

---

## File 1: `frontend/vercel.json`

### AGE (Original):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### PORE (Updated):
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://atsup-server.vercel.app/api/:path*"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Ki Change Hoyche:
- `/api/:path*` requests gulo ke Vercel proxy kore backend (`https://atsup-server.vercel.app`) e pathay
- Browser kheyal korbe frontend + backend **same domain** e ache
- Tai cookie automatically same-origin e set hobe, cross-origin issue solve hobe

---

## File 2: `backend/src/shared/middlewares/middlewareConfig.ts` (CORS)

### AGE (Original):
```typescript
app.use(
  cors({
    origin: [
      env.frontendUrl,
      "http://localhost:5173",
      "http://localhost:4173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

### PORE (Updated):
```typescript
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.frontendUrl,
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

### Ki Change Hoyche:
- Static array er jagai **dynamic function** use kora hoyeche
- `!origin` check add kora hoyeche (proxy/request er khetre origin null aste pare)
- Functionality same, but proxy setup er sathe compatible

---

## File 3: `backend/src/modules/auth/auth.controller.ts`

### 3a. `setAuthCookies` Function

#### AGE (Original):
```typescript
const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
```

#### PORE (Updated):
```typescript
const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  const isProduction = env.nodeEnv === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
```

#### Ki Change Hoyche:
- `env.nodeEnv === "production"` repeatedly check er jagai `isProduction` variable create kora hoyeche (cleaner code)
- Functionality same

---

### 3b. `refreshToken` Endpoint - Cookie Set

#### AGE (Original):
```typescript
res.cookie("accessToken", newAccessToken, {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
});

res.cookie("refreshToken", newRefreshToken, {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

#### PORE (Updated):
```typescript
const isProduction = env.nodeEnv === "production";

res.cookie("accessToken", newAccessToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
});

res.cookie("refreshToken", newRefreshToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

#### Ki Change Hoyche:
- `isProduction` variable add kora hoyeche
- Refresh token cookie te **`path: "/"` add** kora hoyeche (age missing chilo)

---

### 3c. `logout` Endpoint - clearCookie → res.cookie maxAge:0

#### AGE (Original):
```typescript
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
};
```

#### PORE (Updated):
```typescript
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }

    const isProduction = env.nodeEnv === "production";
    const cookieConfig = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
      path: "/",
    };

    res.cookie("accessToken", "", { ...cookieConfig, maxAge: 0 });
    res.cookie("refreshToken", "", { ...cookieConfig, maxAge: 0 });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    const isProduction = env.nodeEnv === "production";
    const cookieConfig = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
      path: "/",
    };

    res.cookie("accessToken", "", { ...cookieConfig, maxAge: 0 });
    res.cookie("refreshToken", "", { ...cookieConfig, maxAge: 0 });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
};
```

#### Ki Change Hoyche:
- **`res.clearCookie`** completely badal diye **`res.cookie("", "", { maxAge: 0 })`** use kora hoyeche
- **Karon:** `clearCookie` Vercel proxy te `Set-Cookie` header properly forward kore na. `res.cookie` diye empty string set + `maxAge: 0` dile browser guaranteed cookie delete kore
- **IMPORTANT:** Cookie set korar shomoy jati attributes (httpOnly, secure, sameSite, path) dewa hoy, clear korar o shetai dite hobe - na hole browser cookie clear korbe na

---

## File 4: `backend/src/modules/auth/auth.routes.ts` (Google OAuth Callback)

### AGE (Original):
```typescript
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### PORE (Updated):
```typescript
const isProduction = env.nodeEnv === "production";

res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### Ki Change Hoyche:
- `isProduction` variable add
- Refresh token cookie te **`path: "/"` add** kora hoyeche (age missing chilo)
- `res.redirect(env.frontendUrl || "http://localhost:4173")` theke **`res.redirect(env.frontendUrl)`** kora hoyeche (commented line remove)

---

## File 5: `backend/src/modules/users/users.controller.ts` (deleteAccount)

### AGE (Original):
```typescript
import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "./users.service";
import { updateProfileSchema } from "./users.validation";

// ... (getProfile, updateProfile same)

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await deleteUserAccount(req.user.id);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account",
    });
  }
};
```

### PORE (Updated):
```typescript
import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "./users.service";
import { updateProfileSchema } from "./users.validation";
import { env } from "../../shared/config/env";

// ... (getProfile, updateProfile same)

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await deleteUserAccount(req.user.id);

    const isProduction = env.nodeEnv === "production";
    const cookieConfig = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
      path: "/",
    };

    res.cookie("accessToken", "", { ...cookieConfig, maxAge: 0 });
    res.cookie("refreshToken", "", { ...cookieConfig, maxAge: 0 });

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account",
    });
  }
};
```

### Ki Change Hoyche:
- `import { env }` add kora hoyeche
- **`res.clearCookie`** badal diye **`res.cookie("", "", { maxAge: 0 })`** use kora hoyeche
- Logout er sathe same approach - cookie set er attributes (httpOnly, secure, sameSite, path) + maxAge:0 dile guaranteed cookie delete hoy

---

## Summary: Ki Ki Fix Kora Hoyche

| Issue | Fix |
|---|---|
| Cookie different domain e set hoy, frontend e pathay na | Vercel proxy/rewrite - same-origin baniyechi |
| `clearCookie` Vercel proxy te kaj kore na | `res.cookie("", "", { maxAge: 0 })` use - guaranteed cookie delete |
| Refresh token cookie te `path: "/"` missing | Google OAuth callback ar refresh endpoint e add |
| CORS strict array - proxy er sathe incompatible | Dynamic function e convert, `!origin` check add |

## Production Environment Variables Required

### Backend Vercel:
```
NODE_ENV=production
FRONTEND_URL=https://<frontend-vercel-url>.vercel.app
GOOGLE_CALLBACK_URL=https://atsup-server.vercel.app/api/auth/google/callback
REDIS_URL=<redis-cloud-or-upstash-url>
```

### Google Cloud Console:
```
Authorized redirect URI: https://atsup-server.vercel.app/api/auth/google/callback
```
