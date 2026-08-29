# Login Cookie Fix - Production Logout Issue

## Somossa ki chilo?

Login korle `accessToken` + `refreshToken` cookie te set hoy, logout e `clearCookie` diye delete korar kotha. Localhost e kaj korto kintu production e hoto na.

**Karon:** `backend/src/modules/auth/auth.controller.ts:26` e cookie set hoy ei option e:

```ts
{
  httpOnly: true,
  secure: env.nodeEnv === "production", // prod: true, local: false
  sameSite: env.nodeEnv === "production" ? "none" : "lax", // prod: "none", local: "lax"
  path: "/",
  maxAge: 15 * 60 * 1000 // ba 7 din
}
```

Kintu `backend/src/modules/auth/auth.controller.ts:249` e `logout` e clear kora hoto sudhu:

```ts
res.clearCookie("accessToken", { path: "/" });
res.clearCookie("refreshToken", { path: "/" });
```

Browser e cookie delete korte hole `clearCookie` er `secure`, `sameSite`, `path`, `httpOnly` **exactly match** korte hoy jeta diye set kora hoyeche (maxAge/expires bade). Local e `secure:false, sameSite:lax` tai `{path:"/"}` diye mile jeto, production e `secure:true, sameSite:"none"` tai mile na - tai delete fail.

> Duplicacy o chilo - `setAuthCookies` + `refreshToken` controller e same option 2 bar copy-paste kora.

## Ki Fix Korlam?

### 1. Single helper `cookieOptions` add — `backend/src/modules/auth/auth.controller.ts:21`

```ts
const cookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : ("lax" as const),
  path: "/",
  ...(maxAge ? { maxAge } : {}),
});
```

- `maxAge` dile set korar jonno use hobe, na dile `clearCookie` er jonno (maxAge chara) use hobe.
- Sob jaygay ek option theke asbe, future e change korle ek jaygay korlei hobe.

### 2. `setAuthCookies` fix — `backend/src/modules/auth/auth.controller.ts:29`

**Age:**
```ts
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
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

**Pore:**
```ts
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
};
```

### 3. `refreshToken` controller fix — `backend/src/modules/auth/auth.controller.ts:210`

**Age:**
```ts
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
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**Pore:**
```ts
res.cookie("accessToken", newAccessToken, cookieOptions(15 * 60 * 1000));
res.cookie("refreshToken", newRefreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
```

### 4. `logout` fix (Main Bug) — `backend/src/modules/auth/auth.controller.ts:226`

**Age:**
```ts
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.json({ success: true, message: "Logged out successfully" });
  }
};
```

**Pore:**
```ts
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }
    res.clearCookie("accessToken", cookieOptions());
    res.clearCookie("refreshToken", cookieOptions());
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.clearCookie("accessToken", cookieOptions());
    res.clearCookie("refreshToken", cookieOptions());
    res.json({ success: true, message: "Logged out successfully" });
  }
};
```

> `cookieOptions()` call e `maxAge` pass kori nai, tai `clearCookie` e sudhu `httpOnly, secure, sameSite, path` jabe — etai browser er jonno correct.

## Ar kichu change kori nai

- Token create (`createTokens`), redis `storeRefreshToken/deleteRefreshToken`, error handling, status code — sob ager motoi ache.

## Verify

```bash
npm --prefix backend run build
# -> dist/server.js 279.9kb  Done in 19ms (success)

git diff backend/src/modules/auth/auth.controller.ts
# helper + 4ta jaygay replacement dekhabe

# Revert korte chaile:
git checkout -- backend/src/modules/auth/auth.controller.ts
```

## Folafol

- Local + Production duitai ekhon logout e cookie sothik vabe delete hobe.
- Cookie option ek jayga theke control hobe, duplicate code komlo.
