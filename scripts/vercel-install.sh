#!/usr/bin/env sh
set -eu

# GitHub repo used for LFS (matches .lfsconfig). Vercel env vars override when present.
DEFAULT_REPO_OWNER="mubdisurgicalsinstruments"
DEFAULT_REPO_SLUG="Mubdi-Website"
DEFAULT_ORIGIN_URL="https://github.com/${DEFAULT_REPO_OWNER}/${DEFAULT_REPO_SLUG}.git"
DEFAULT_LFS_URL="${DEFAULT_ORIGIN_URL}/info/lfs"

log() {
  printf '%s\n' "$*"
}

install_git_lfs() {
  if command -v git-lfs >/dev/null 2>&1; then
    return 0
  fi

  if command -v dnf >/dev/null 2>&1; then
    dnf install -y git-lfs
  elif command -v yum >/dev/null 2>&1; then
    yum install -y git-lfs
  elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y git-lfs
  else
    log "git-lfs is required on Vercel but could not be installed." >&2
    exit 1
  fi
}

resolve_origin_url() {
  origin_url="$(git remote get-url origin 2>/dev/null || true)"
  if [ -n "$origin_url" ]; then
    printf '%s' "$origin_url"
    return 0
  fi

  if [ -n "${VERCEL_GIT_REPO_OWNER:-}" ] && [ -n "${VERCEL_GIT_REPO_SLUG:-}" ]; then
    printf 'https://github.com/%s/%s.git' "$VERCEL_GIT_REPO_OWNER" "$VERCEL_GIT_REPO_SLUG"
    return 0
  fi

  printf '%s' "$DEFAULT_ORIGIN_URL"
}

to_https_lfs_url() {
  raw_url="$1"

  case "$raw_url" in
    git@github.com:*)
      repo_path="${raw_url#git@github.com:}"
      repo_path="${repo_path%.git}"
      printf 'https://github.com/%s.git/info/lfs' "$repo_path"
      ;;
    http://*|https://*)
      base="${raw_url%%@github.com/*}"
      if [ "$base" != "$raw_url" ]; then
        rest="${raw_url#*@github.com/}"
        raw_url="https://github.com/${rest}"
      fi
      raw_url="${raw_url%.git}"
      printf '%s.git/info/lfs' "$raw_url"
      ;;
    *)
      raw_url="${raw_url%.git}"
      printf 'https://github.com/%s.git/info/lfs' "$raw_url"
      ;;
  esac
}

ensure_origin_remote() {
  origin_url="$(resolve_origin_url)"
  log "Resolved origin URL: ${origin_url}"

  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "$origin_url"
  else
    git remote add origin "$origin_url"
  fi
}

configure_lfs_endpoint() {
  origin_url="$(resolve_origin_url)"
  lfs_url="$(to_https_lfs_url "$origin_url")"

  if [ -z "$lfs_url" ] || ! printf '%s' "$lfs_url" | grep -q '^https://'; then
    log "Failed to resolve a valid HTTPS Git LFS endpoint (got: '${lfs_url}')." >&2
    exit 1
  fi

  log "Configuring Git LFS endpoint: ${lfs_url}"
  git config -f .lfsconfig remote.origin.lfsurl "$lfs_url"
  git config lfs.url "$lfs_url"
  git config lfs.repositoryformatversion 0
  git config lfs.https://github.com/mubdisurgicalsinstruments/Mubdi-Website.git/info/lfs.access basic
}

configure_lfs_credentials() {
  origin_url="$(git remote get-url origin 2>/dev/null || true)"

  if printf '%s' "$origin_url" | grep -q '@github.com'; then
    log "Using credentials embedded in origin remote URL for Git LFS."
    return 0
  fi

  if [ -n "${GITHUB_TOKEN:-}" ]; then
    log "Configuring Git LFS credentials from GITHUB_TOKEN."
    git config credential.helper store
    printf 'https://x-access-token:%s@github.com\n' "$GITHUB_TOKEN" > "$HOME/.git-credentials"
    return 0
  fi

  log "No embedded origin credentials or GITHUB_TOKEN; using anonymous LFS fetch (public repo)."
}

fetch_lfs_objects() {
  ref="${VERCEL_GIT_COMMIT_REF:-main}"
  log "Fetching Git LFS objects for ref: ${ref}"

  git lfs fetch origin "$ref" --all || git lfs fetch --all
  git lfs checkout
}

install_git_lfs
git lfs install --local
ensure_origin_remote
configure_lfs_endpoint
configure_lfs_credentials

log "Git LFS environment:"
git lfs env 2>&1 | grep -E '^(Endpoint|LocalWorkingDir)=' || git lfs env 2>&1 | head -5

fetch_lfs_objects

if [ "${SKIP_NPM_INSTALL:-}" != "1" ]; then
  npm install
fi
