#!/usr/bin/env bash
#
# publish.sh — interactive npm publish checklist for @mrhiden/cstruct.
# Steps: preconditions -> version check/bump -> tests -> dry-run -> publish -> tag & push.
#
set -euo pipefail

BOLD=$'\033[1m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; RESET=$'\033[0m'

die()  { printf '%s\n' "${RED}✗ $*${RESET}" >&2; exit 1; }
info() { printf '%s\n' "${BOLD}▶ $*${RESET}"; }
ok()   { printf '%s\n' "${GREEN}✓ $*${RESET}"; }
warn() { printf '%s\n' "${YELLOW}! $*${RESET}"; }

ask() { # ask "Question" ["Y"|"N"] -> 0 when yes
    local question=$1 default=${2:-N} answer
    if [ "$default" = "Y" ]; then
        read -r -p "$question [Y/n] " answer
        [ -z "$answer" ] && answer=Y
    else
        read -r -p "$question [y/N] " answer
        [ -z "$answer" ] && answer=N
    fi
    [[ "$answer" =~ ^[Yy]$ ]]
}

# --- 0. Preconditions -------------------------------------------------------
[ -f package.json ] || die "Run from the repository root (package.json not found)."
command -v npm >/dev/null || die "npm not found."

if [ -n "$(git status --porcelain)" ]; then
    git status --short
    ask "Working tree is not clean. Continue anyway?" N || die "Aborted. Commit or stash first."
fi

BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    ask "You are on branch '$BRANCH', not 'main'. Publish anyway?" N || die "Aborted. Switch to main."
fi

# --- 1. Version -------------------------------------------------------------
CURRENT_VERSION=$(node -p "require('./package.json').version")
info "Version in package.json: ${BOLD}$CURRENT_VERSION${RESET}"

if ask "Have you already bumped the version in package.json?" N; then
    VERSION=$CURRENT_VERSION
else
    echo "  1) patch  ($CURRENT_VERSION -> $(node -p "const v='$CURRENT_VERSION'.split('.').map(Number); (v[2]+1>=10?'x':v[2]+1) && [v[0],v[1],v[2]+1].join('.')"))"
    echo "  2) minor"
    echo "  3) major"
    echo "  4) skip (publish current version as-is)"
    read -r -p "Bump version [1-4]: " choice
    case "$choice" in
        1) LEVEL=patch ;; 2) LEVEL=minor ;; 3) LEVEL=major ;;
        4) LEVEL=none   ;; *) die "Invalid choice." ;;
    esac
    if [ "$LEVEL" != "none" ]; then
        npm version "$LEVEL" --no-git-tag-version > /dev/null
        git add package.json package-lock.json
        VERSION=$(node -p "require('./package.json').version")
        git commit -m "chore(release): v$VERSION"
        ok "Bumped to $VERSION and committed."
    else
        VERSION=$CURRENT_VERSION
        warn "Publishing current version $VERSION without a bump."
    fi
fi

# --- 2. Registry / local sanity --------------------------------------------
REGISTRY=$(npm config get registry)
info "Publishing from: ${BOLD}this machine ($(git config user.name))${RESET}"
info "Registry: $REGISTRY"
[[ "$REGISTRY" == *"registry.npmjs.org"* ]] || warn "Registry is NOT npmjs.org — check your .npmrc!"
WHOAMI=$(npm whoami 2>/dev/null || echo "(not logged in)")
info "npm user: $WHOAMI"
if [[ "$WHOAMI" == *"(not logged in)"* ]]; then
    if ask "Not logged in to npm. Run 'npm login' now?" Y; then
        npm login
        WHOAMI=$(npm whoami 2>/dev/null || die "Still not logged in after 'npm login'.")
        ok "Logged in as $WHOAMI."
    else
        die "Not logged in to npm. Run 'npm login' first."
    fi
fi
ask "Proceed with publish from this machine?" N || die "Aborted."

# --- 3. Tests ---------------------------------------------------------------
if ask "Run the test suite before publishing? [recommended]" Y; then
    npm test
    ok "Tests passed."
fi

# --- 4. Dry run -------------------------------------------------------------
info "npm publish --dry-run:"
npm publish --dry-run
echo
ask "Dry run looks good. Proceed with the real publish?" N || die "Aborted before publish (nothing was uploaded)."

# --- 5. Publish -------------------------------------------------------------
npm publish
ok "Published $VERSION to $REGISTRY."

# --- 6. Tag & push ----------------------------------------------------------
TAG="v$VERSION"
if ask "Create and push tag $TAG (and push commits)?" Y; then
    git tag "$TAG"
    git push origin "$BRANCH"
    git push origin "$TAG"
    ok "Pushed $BRANCH and tag $TAG."
else
    warn "Remember: git tag $TAG && git push origin $TAG"
fi

printf '%s\n' "${GREEN}${BOLD}✔ Done. $VERSION is live. (npm logout when finished)${RESET}"
