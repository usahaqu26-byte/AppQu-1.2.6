#!/usr/bin/env bash
# Root wrapper that forwards commands to android/gradlew
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
if [ -f "$DIR/android/gradlew" ]; then
    chmod +x "$DIR/android/gradlew"
    cd "$DIR/android" && exec ./gradlew "$@"
else
    echo "ERROR: android/gradlew not found. Run 'npx cap add android' first."
    exit 1
fi
