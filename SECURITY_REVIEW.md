# Security Review: Admin Login System

## ⚠️ CURRENT SECURITY STATUS: DEVELOPMENT ONLY - NOT PRODUCTION READY

### Critical Security Issues

#### 1. **Hardcoded Credentials (CRITICAL)**
**Location:** `src/lib/auth.ts`

```typescript
const ADMIN_USERS = {
  'sherard@manilawatch.com': {
    password: 'WatchDealer2025!',  // ❌ PLAIN TEXT PASSWORD
    // ...
  }
};
```

**Risk Level:** 🔴 CRITICAL
**Issue:** Passwords are stored in plain text in the source code
**Impact:** Anyone with access to the code can see the admin password
**Exposure:** Password is visible in:
- Source code repository
- Bundled JavaScript files sent to browser
- Browser DevTools

**Production Requirements:**
- ✅ Move credentials to environment variables (.env file)
- ✅ Hash passwords using bcrypt or argon2
- ✅ Store hashed passwords in database (NOT source code)
- ✅ Implement password reset flow
- ✅ Add 2FA for admin accounts

---

#### 2. **Client-Side Only Authentication (CRITICAL)**
**Location:** All authentication logic runs in browser

**Risk Level:** 🔴 CRITICAL
**Issue:** Authentication can be bypassed using browser DevTools
**How to bypass:**
1. Open DevTools → Console
2. Type: `localStorage.setItem('admin_token', 'fake-token')`
3. Access admin dashboard

**Production Requirements:**
- ✅ Move authentication to backend server (Next.js API routes or Express)
- ✅ Verify JWT tokens on server for every request
- ✅ Use HTTP-only cookies (not localStorage)
- ✅ Implement CSRF protection
- ✅ Rate limiting on login attempts

---

#### 3. **Session Token Generation (HIGH)**
**Location:** `src/lib/auth.ts`

```typescript
function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36)}`;  // ❌ WEAK
}
```

**Risk Level:** 🟡 HIGH
**Issue:** Tokens are predictable and can be guessed
**Production Requirements:**
- ✅ Use cryptographically secure random tokens (crypto.randomBytes)
- ✅ Use proper JWT library (jsonwebtoken)
- ✅ Sign tokens with secret key
- ✅ Include expiration and user info in token payload

---

#### 4. **No HTTPS Enforcement (MEDIUM)**
**Issue:** Credentials can be intercepted if sent over HTTP

**Production Requirements:**
- ✅ Enforce HTTPS in production
- ✅ Set Secure flag on cookies
- ✅ Use HSTS headers
- ✅ Redirect HTTP to HTTPS

---

#### 5. **No Rate Limiting (MEDIUM)**
**Issue:** Unlimited login attempts allow brute force attacks

**Production Requirements:**
- ✅ Limit to 5 failed attempts per 15 minutes
- ✅ Implement account lockout after 10 failed attempts
- ✅ Add CAPTCHA after 3 failed attempts
- ✅ Log all failed login attempts

---

### ✅ What IS Secure (For Development)

1. **Session Expiration**: 24-hour token expiration is implemented
2. **Protected Routes**: ProtectedRoute component prevents unauthorized access to UI
3. **Logout Clears Data**: Properly removes tokens on logout
4. **Session Verification**: Checks token on page load

### ❌ What Is NOT Secure

1. **Anyone can read the password** from source code
2. **Anyone can create fake tokens** in browser console
3. **No protection against** brute force attacks
4. **Credentials sent** without encryption (if not HTTPS)
5. **No audit logging** of admin actions

---

## 🔒 Production-Ready Security Checklist

### MUST HAVE Before Deployment:

#### Backend Authentication (Required)
- [ ] Migrate to Next.js API routes or separate backend
- [ ] Move passwords to .env file (never commit to git)
- [ ] Hash passwords with bcrypt (cost factor 12+)
- [ ] Generate JWT tokens with crypto.randomBytes
- [ ] Verify tokens on server for every API call
- [ ] Use HTTP-only cookies (not localStorage)

#### Password Security
- [ ] Require strong passwords (min 12 chars, mixed case, numbers, symbols)
- [ ] Implement password reset via email
- [ ] Add 2FA (Time-based One-Time Password)
- [ ] Rotate session tokens on privilege change

#### Rate Limiting & Monitoring
- [ ] Rate limit login: 5 attempts per 15 min per IP
- [ ] Rate limit API calls: 100 requests per minute per user
- [ ] Log all authentication events
- [ ] Alert on suspicious activity (multiple failed logins)

#### Network Security
- [ ] Enforce HTTPS only
- [ ] Set secure cookie flags (HttpOnly, Secure, SameSite=Strict)
- [ ] Add CSRF tokens
- [ ] Implement CORS properly
- [ ] Use Content Security Policy (CSP) headers

#### Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Never log passwords (even hashed)
- [ ] Sanitize all inputs to prevent XSS
- [ ] Use parameterized queries to prevent SQL injection
- [ ] Regular security audits

---

## 🛠️ Recommended Architecture for Production

### Option 1: Next.js App Router (Recommended)

```
manila-watch-atelier/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # POST /api/auth/login
│   │   │   ├── logout/route.ts      # POST /api/auth/logout
│   │   │   └── verify/route.ts      # GET /api/auth/verify
│   │   └── admin/
│   │       ├── watches/route.ts     # CRUD operations
│   │       └── middleware.ts        # Auth verification
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── dashboard/page.tsx
│   └── layout.tsx
├── .env.local                       # NOT committed to git
│   ADMIN_EMAIL=sherard@...
│   ADMIN_PASSWORD_HASH=                $2b$12$...
│   JWT_SECRET=<random-256-bit-key>
│   DATABASE_URL=postgres://...
└── middleware.ts                    # Global auth middleware
```

### Backend API Example (Next.js)

```typescript
// app/api/auth/login/route.ts
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Get user from database (NOT from source code)
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    await delay(1000); // Prevent timing attacks
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Verify password hash
  const isValid = await compare(password, user.passwordHash);

  if (!isValid) {
    // Log failed attempt
    await logFailedLogin(email, request.headers.get('x-forwarded-for'));
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Generate secure JWT
  const token = sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  // Set HTTP-only cookie
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 86400 // 24 hours
  });

  return Response.json({ success: true });
}
```

### Option 2: Separate Express Backend

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   └── admin.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── rateLimit.ts
│   ├── models/
│   │   └── User.ts
│   └── server.ts
└── .env                    # NOT committed
    DATABASE_URL=...
    JWT_SECRET=...
    ADMIN_PASSWORD_HASH=...
```

---

## 📝 Environment Variables Setup

### Create `.env.local` (NEVER commit this file)

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/manila_watch"

# Authentication
JWT_SECRET="<generate-with: openssl rand -base64 64>"
ADMIN_EMAIL="sherard@manilawatch.com"
ADMIN_PASSWORD_HASH="<generate-with: bcrypt-cli>"

# API Keys
STRIPE_SECRET_KEY="sk_live_..."
EXCHANGE_RATE_API_KEY="..."

# Email (for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="noreply@manilawatch.com"
SMTP_PASS="..."

# URLs
NEXT_PUBLIC_APP_URL="https://manilawatch.atelier"
```

### Update `.gitignore`

```
.env
.env.local
.env.*.local
```

---

## 🚨 IMMEDIATE ACTION REQUIRED

### Before ANY public deployment:

1. **STOP** - Do NOT deploy current code to production
2. **REMOVE** hardcoded password from `src/lib/auth.ts`
3. **IMPLEMENT** backend authentication (see architecture above)
4. **HASH** passwords using bcrypt
5. **STORE** credentials in environment variables
6. **TEST** security with penetration testing tools
7. **REVIEW** by security professional

---

## ✅ Acceptable Use Cases for Current Implementation

### ✅ SAFE:
- Local development and testing
- Internal demos (not internet-accessible)
- Localhost-only environments
- Learning/educational purposes

### ❌ UNSAFE:
- Public internet deployment
- Production environment
- Any server accessible from internet
- Shared hosting environments
- Customer-facing systems

---

## 📚 Recommended Security Resources

### Libraries
- **bcrypt** or **argon2** - Password hashing
- **jsonwebtoken** - JWT token generation
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers
- **express-validator** - Input sanitization

### Tools
- **OWASP ZAP** - Security testing
- **Snyk** - Dependency vulnerability scanning
- **SonarQube** - Code security analysis

### Learning
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Web Security by Stanford: https://web.stanford.edu/class/cs253/
- Auth0 Blog: https://auth0.com/blog/

---

## 📞 Need Help?

Consider hiring a security consultant before production deployment. A professional security audit is recommended for any system handling sensitive data or authentication.

**Estimated cost for basic security audit:** $500-$2000 USD
**Time investment to secure properly:** 1-2 weeks of development

---

## ⚡ Quick Win: Temporary Security Improvements

While NOT production-ready, these can improve security slightly:

1. **Obfuscate password** (still not secure, but better than plain text):
   ```typescript
   const pwd = atob('V2F0Y2hEZWFsZXIyMDI1IQ=='); // Base64 encoded
   ```

2. **Add basic rate limiting client-side**:
   ```typescript
   const attempts = parseInt(localStorage.getItem('login_attempts') || '0');
   if (attempts >= 5) {
     alert('Too many attempts. Wait 15 minutes.');
     return;
   }
   ```

3. **Use session storage** instead of localStorage (cleared on tab close):
   ```typescript
   sessionStorage.setItem('admin_token', token);
   ```

**WARNING:** These are Band-Aids. They do NOT make the system production-ready.

---

## 📊 Security Risk Summary

| Component | Current Risk | With Backend | Production Ready |
|-----------|--------------|--------------|------------------|
| Password Storage | 🔴 Critical | 🟢 Low | ✅ Yes |
| Authentication | 🔴 Critical | 🟢 Low | ✅ Yes |
| Token Generation | 🟡 High | 🟢 Low | ✅ Yes |
| Rate Limiting | 🟡 High | 🟢 Low | ✅ Yes |
| HTTPS | 🟡 High | 🟢 Low | ✅ Yes |
| **Overall** | 🔴 **NOT SAFE** | 🟢 **SAFE** | ✅ **READY** |

---

## 🎯 Bottom Line

**Current State:** ✅ Perfect for development and testing
**For Production:** ❌ **DO NOT DEPLOY** - Backend authentication required

**Timeline to Production-Ready:**
- With Next.js migration: 1-2 weeks
- With separate backend: 2-3 weeks
- With security audit: +1 week

The admin system you have is **functionally complete** and **perfect for demo/testing**, but needs **backend authentication** before any public deployment.
