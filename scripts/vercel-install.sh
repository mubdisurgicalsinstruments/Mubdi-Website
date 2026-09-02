#!/usr/bin/env sh
set -eu

if ! command -v git-lfs >/dev/null 2>&1; then
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y git-lfs
  elif command -v yum >/dev/null 2>&1; then
    yum install -y git-lfs
  elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y git-lfs
  else
    echo "git-lfs is required on Vercel but could not be installed." >&2
    exit 1
  fi
fi

git lfs install
git lfs pull

npm install
