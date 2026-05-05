# DataProtect MES Security Verification Matrix (Phase 1)

| Control | Config line/file | Test command | Expected result |
|---|---|---|---|
| Security headers present | `nginx.conf` `add_header` directives in `server` block | `curl.exe -I http://localhost:8080/` | Response includes `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy` |
| HSTS absent on HTTP | `nginx.conf` intentionally has no `Strict-Transport-Security` | `curl.exe -I http://localhost:8080/ | findstr /I "Strict-Transport-Security"` | No output |
| API allowlist permits IT subnet | `nginx.conf` `/api/` `allow 192.168.20.0/24;` | `curl.exe -i http://localhost:8080/api/overview` (from `192.168.20.0/24`) | `200` (or upstream success), JSON payload |
| API deny outside subnet | `nginx.conf` `/api/` `deny all;` | `curl.exe -i http://localhost:8080/api/overview` (from non-`192.168.20.0/24`) | `403 Forbidden` |
| POST blocked on API | `nginx.conf` method filter `if ($request_method !~ ^(GET\|HEAD\|OPTIONS)$)` | `curl.exe -i -X POST http://localhost:8080/api/overview` | `405 Not Allowed` |
| GET allowed on API | `nginx.conf` method filter | `curl.exe -i -X GET http://localhost:8080/api/overview` | `200` from allowed subnet |
| `/.env` blocked | `nginx.conf` anti-scan `location ~*` | `curl.exe -i http://localhost:8080/.env` | `404` |
| `/.git` blocked | `nginx.conf` anti-scan `location ~*` | `curl.exe -i http://localhost:8080/.git` | `404` |
| `/wp-admin` blocked | `nginx.conf` anti-scan `location ~*` | `curl.exe -i http://localhost:8080/wp-admin` | `404` |
| SPA fallback works | `nginx.conf` `location / { try_files ... /index.html; }` | `curl.exe -i http://localhost:8080/powergrid/deep/link` | `200` HTML (`index.html`) |
| Static assets served with caching | `nginx.conf` `location /assets/` | `curl.exe -I http://localhost:8080/assets/index.css` | `200` with `Cache-Control: public, immutable` |
| API rate limit active | `nginx.conf` `limit_req_zone` + `/api/` `limit_req` | `for /L %i in (1,1,40) do @curl -s -o NUL -w "%{http_code}\n" http://localhost:8080/api/overview` | Mostly `200`; can include `429` under burst pressure |
| CORS wildcard not present | `nginx.conf` has no wildcard CORS header | `curl.exe -I http://localhost:8080/ | findstr /I "Access-Control-Allow-Origin"` | No wildcard header; same-origin behavior retained |
| Docker/Compose unchanged | Repo state check | `git diff -- Dockerfile DOCKER_COMPOSE.yml` | No diff output |

## Notes
- If testing from the same host as Nginx and that host IP is not in `192.168.20.0/24`, allowed/denied API tests must be run from an appropriate client or documented as environment-limited.
- API success assumes Node-RED target `http://192.168.20.10:1880` is reachable from Nginx runtime network.
