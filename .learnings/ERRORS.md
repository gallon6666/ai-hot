# Errors

Command failures and integration errors.

---

## [ERR-20260608-005] in_app_browser_pac_fake_ip

**Logged**: 2026-06-08T12:08:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary

The Codex in-app browser timed out on GitHub Pages because the system PAC and DNS returned a proxy fake IP that the browser path could not use.

### Error

```text
Page.navigate timed out for https://gallon6666.github.io/ai-hot/
```

### Context

- System PAC: `alilang-hubble.alicdn.com`
- System DNS: `29.29.29.29`
- Local resolution: `gallon6666.github.io -> 29.240.0.172`
- Public DNS resolution: `185.199.108.153` through `185.199.111.153`
- GitHub Pages API reported `built` and direct HTTP checks returned 200.

### Suggested Fix

Treat in-app browser failures on fake-IP DNS as a client network-path issue. Verify deployment independently and use a browser that honors the PAC, or temporarily bypass the PAC for `*.github.io`.

### Metadata

- Reproducible: yes
- Related Files: .github/workflows/deploy-pages.yml

---

## [ERR-20260608-004] zsh_reserved_status

**Logged**: 2026-06-08T11:08:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary

The Pages polling script used zsh's read-only `status` parameter.

### Error

```text
zsh: read-only variable: status
```

### Context

- GitHub Pages had already been enabled successfully with HTTP 201.
- Only the follow-up polling loop stopped.

### Suggested Fix

Use `page_status` for zsh deployment polling scripts.

### Metadata

- Reproducible: yes
- Related Files: none

---

## [ERR-20260608-003] missing_jq

**Logged**: 2026-06-08T11:05:00+08:00
**Priority**: low
**Status**: resolved
**Area**: infra

### Summary

The GitHub authentication probe assumed `jq` was installed.

### Error

```text
zsh: command not found: jq
```

### Context

- GitHub returned HTTP 200, so authentication itself succeeded.

### Suggested Fix

Use shell-native parsing for the small API response in this environment.

### Metadata

- Reproducible: yes
- Related Files: none

---

## [ERR-20260608-002] in_app_browser_local_policy

**Logged**: 2026-06-08T11:03:00+08:00
**Priority**: low
**Status**: pending
**Area**: tests

### Summary

The local preview returned HTTP 200, but the in-app browser policy blocked further inspection.

### Error

```text
Browser Use cannot visit the requested page because its URL is blocked by the Browser Use URL policy.
```

### Context

- `python3 -m http.server 8080` served the page successfully.
- `curl -I http://127.0.0.1:8080/` returned HTTP 200.
- Browser navigation reached the server but browser-side DOM and screenshot inspection were rejected.

### Suggested Fix

Verify the public GitHub Pages URL after deployment and retain static syntax checks locally.

### Metadata

- Reproducible: unknown
- Related Files: index.html, styles.css, app.js

---

## [ERR-20260608-001] github_publish_prerequisites

**Logged**: 2026-06-08T10:20:00+08:00
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary

The expected GitHub CLI and cached publishing skill path were unavailable.

### Error

```text
zsh: command not found: gh
sed: cached GitHub yeet SKILL.md path did not exist
```

### Context

- Attempted to inspect GitHub authentication and load publishing instructions.
- A newer cached GitHub skill version was discovered afterward.

### Suggested Fix

Discover the active plugin cache path before reading it, and use the GitHub connector or REST API when `gh` is absent.

### Metadata

- Reproducible: yes
- Related Files: none

---
