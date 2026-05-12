# Deployment Checklist

Pre-deployment checklist for the Change platform. Work through each section top to bottom before going live.

---

## 1. Secrets & Environment Variables

- [ ] `JWT_SECRET` — generated with `openssl rand -hex 64`, never the example value
- [ ] `POSTGRES_PASSWORD` / `DATABASE_URL` — strong password, not `postgres`
- [ ] `REDIS_PASSWORD` — set and matches the value in `REDIS_URL`
- [ ] `TOSS_SECRET_KEY` / `TOSS_WEBHOOK_SECRET` — from Toss Payments dashboard
- [ ] `CORS_ORIGINS` — set to exact production frontend URL(s), no trailing slash
- [ ] `NEXT_PUBLIC_API_URL` — production API URL, passed as `--build-arg` at Docker build time
- [ ] `APP_URL` / `API_URL` — used in email links and og tags
- [ ] No `.env` file is committed to the repository (`.gitignore` covers this)

---

## 2. Database

- [ ] `prisma migrate deploy` runs cleanly against the production database (entrypoint.sh handles this automatically)
- [ ] Database is not accessible from the public internet — only the API container can reach it
- [ ] Automated backups are configured (e.g., RDS snapshots, pg_dump cron)
- [ ] `SEED_ON_START` is `false` or unset in production

---

## 3. Docker Images

- [ ] API image builds without errors: `docker build -f apps/api/Dockerfile .`
- [ ] Web image builds without errors: `docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=<prod-url> .`
- [ ] Images are pushed to a private registry (not Docker Hub public)
- [ ] Image tags use a commit SHA or semver, not `latest`

---

## 4. Networking

- [ ] A reverse proxy (Nginx, Caddy, or a cloud load balancer) terminates TLS in front of both services
- [ ] HTTPS is enforced; HTTP redirects to HTTPS
- [ ] API is reachable at the path expected by the web frontend (`NEXT_PUBLIC_API_URL`)
- [ ] Health check endpoint responds: `GET /api/health` → `{"status":"ok"}`
- [ ] Postgres and Redis ports are **not** exposed to the host in production (remove `ports:` from compose or use an internal network)

---

## 5. CI / CD

- [ ] GitHub Actions CI passes on the `main` branch (lint, typecheck, test, build, docker-build)
- [ ] Docker image build job is green (runs on push to main only)
- [ ] Deployment pipeline (CD) triggers only after CI is green
- [ ] Rollback procedure is documented and tested

---

## 6. Runtime Checks (post-deploy)

- [ ] `GET /api/health` returns `200 {"status":"ok"}` from the production URL
- [ ] User registration and login work end to end
- [ ] Petition creation, listing, and signing work end to end
- [ ] Admin dashboard loads (requires ADMIN role user)
- [ ] Review queue shows pending petitions
- [ ] No errors in container logs (`docker logs change_api_prod`)

---

## 7. Known Local vs Production Differences

| Area | Local | Production |
|------|-------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Baked in at image build time — rebuild image on change |
| Database migrations | `prisma migrate dev` (creates migration files) | `prisma migrate deploy` (applies existing files only) |
| Seeding | `SEED_ON_START=true` allowed | Must be `false` — entrypoint guard enforces this |
| TLS | None | Required — terminate at proxy |
| Redis auth | None | `REDIS_PASSWORD` required |
| CORS | `localhost:3000` | Exact production origin(s) |
| Log level | `debug` | `info` or `warn` |

---

## 8. Remaining Risks Before First Public Launch

- **Payment integration** — Toss webhook signature verification must be tested against live webhooks, not just mocks
- **Email delivery** — No email service is wired up yet; password reset and notification flows are stubs
- **Rate limiting** — No rate limiting middleware on API endpoints yet (recommended before public exposure)
- **File uploads** — S3-compatible storage is planned but not implemented
- **Search** — OpenSearch/Elasticsearch integration is planned but not implemented; current search is DB-level ILIKE
