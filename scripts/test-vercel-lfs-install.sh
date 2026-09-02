#!/usr/bin/env sh
# Simulates Vercel's missing-origin LFS state and verifies the install script fixes it.
set -eu

cd "$(dirname "$0")/.."

export VERCEL=1
export VERCEL_GIT_REPO_OWNER=mubdisurgicalsinstruments
export VERCEL_GIT_REPO_SLUG=Mubdi-Website
export VERCEL_GIT_COMMIT_REF=main
export SKIP_NPM_INSTALL=1

if git remote get-url origin >/dev/null 2>&1; then
  git remote rename origin origin-backup-test
  RESTORE_ORIGIN=1
else
  RESTORE_ORIGIN=0
fi

cleanup() {
  if [ "$RESTORE_ORIGIN" -eq 1 ]; then
    git remote remove origin 2>/dev/null || true
    git remote rename origin-backup-test origin
  fi
}
trap cleanup EXIT

git config --local --unset-all lfs.url 2>/dev/null || true

sh scripts/vercel-install.sh

endpoint="$(git lfs env 2>&1 | grep '^Endpoint=' | cut -d= -f2-)"
case "$endpoint" in
  https://*) ;;
  *)
    echo "Expected HTTPS LFS endpoint, got: ${endpoint}" >&2
    exit 1
    ;;
esac

node scripts/verify-public-images.mjs
echo "Vercel LFS install simulation passed."
