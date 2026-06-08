# Errors

Command failures and integration errors.

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
