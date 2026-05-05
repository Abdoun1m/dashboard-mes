# DataProtect MES Security Implementation (Phase 1)

## Current security scope
This phase applies HTTP hardening at the Nginx frontend layer only.

Included:
- Nginx request filtering and response security headers
- `/api/*` network restriction and rate limiting
- Scanner-path blocking
- Documentation and verification matrix

Not included in this phase:
- Dockerfile changes
- `DOCKER_COMPOSE.yml` changes
- TLS/SSL/certificate generation or mounts

## Implemented controls

### 1. Security headers
Implemented in `nginx.conf`:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restrictive baseline
- `Content-Security-Policy` compatible with current React/Vite SPA delivery

Intentionally not implemented:
- `Strict-Transport-Security` (HSTS) is deferred until HTTPS is enabled.

### 2. HTTP method restrictions
Global policy:
- Allow: `GET`, `HEAD`, `OPTIONS`
- Block others with `405`

API policy (`/api/*`):
- Same allowlist (`GET`, `HEAD`, `OPTIONS`)
- `POST`, `PUT`, `PATCH`, `DELETE` return `405` unless explicitly enabled in a future phase.

### 3. IT network restriction for API
On `/api/*`:
- Allow: `192.168.20.0/24`
- Deny: all others

Frontend browsing (`/`, `/assets/*`) remains reachable as currently configured.

### 4. Anti-scan path blocking
Blocked with immediate `404`:
- `/.env`
- `/.git`
- `/wp-admin`
- `/wp-login.php`
- `/phpmyadmin`
- `/admin`
- `/server-status`

### 5. API rate limiting
Per-client IP limit on `/api/*`:
- `10r/s` with `burst=20` and `nodelay`
- `429` on limit violations

This is conservative for dashboard polling and easy to tune in place later.

### 6. Request and proxy limits
- `client_max_body_size 1m`
- `proxy_connect_timeout 10s`
- `proxy_send_timeout 30s`
- `proxy_read_timeout 60s`

### 7. SPA and proxy behavior preserved
- React SPA fallback retained: `try_files $uri $uri/ /index.html`
- Existing Node-RED proxy target preserved: `http://192.168.20.10:1880`
- Static assets continue immutable caching under `/assets/*`

## Threat model summary
Primary threats addressed in this phase:
- Opportunistic scanner probes for sensitive/common admin paths
- Clickjacking and MIME sniffing risks
- Overly broad browser capability access
- Method abuse against read-only API surface
- Excessive request bursts from single clients
- Untrusted subnets calling internal MES API routes

Deferred threats (Phase 2+):
- Network interception risk (requires TLS)
- Advanced payload inspection (WAF/ModSecurity)
- Mutual trust/authn at transport layer (mTLS)

## Nginx route protection model
- `/`: SPA delivery with deep-link fallback to `index.html`
- `/assets/*`: static immutable assets with strong cache headers
- `/api/*`: method restricted, subnet allowlisted, rate-limited, proxied to Node-RED
- Scanner paths: explicit deny-by-path with `404`

## CSRF posture
Current CSRF risk is low because:
- API surface is enforced as `GET/HEAD/OPTIONS` only
- No cookie-based authenticated session is used at this layer
- No command/write endpoints are enabled in current scope

Future TODO:
- Add anti-CSRF tokens or equivalent protections when write APIs (`POST/PUT/PATCH/DELETE`) are introduced.

## CORS policy
- Same-origin model is preserved.
- No wildcard `Access-Control-Allow-Origin` is configured.
- `OPTIONS` is handled safely for allowed methods.

## IP restriction model (192.168.20.0/24)
API access control is implemented at Nginx location level:
- `allow 192.168.20.0/24;`
- `deny all;`

Note:
- If runtime topology introduces reverse proxies/NAT in front of Nginx, `real_ip` trust chain may be needed to preserve accurate client-IP enforcement in a future phase.

## Rollback procedure

### Fast rollback to checkpoint
```powershell
git switch codex/rollback-before-nginx-http-hardening
```

### Rollback local Phase 1 edits only
```powershell
git restore nginx.conf
Remove-Item -Recurse -Force docs\security
```

### Validate rollback
```powershell
git status --short
git diff -- Dockerfile DOCKER_COMPOSE.yml
```

## Controls intentionally deferred (Phase 2)
- TLS/SSL enablement
- HSTS
- mTLS
- WAF/ModSecurity
- Docker hardening
- Compose hardening
- Certificate generation/mounting/rotation
