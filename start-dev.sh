#!/usr/bin/env bash
# ==============================================================================
# CIVIL CONNECTION - STARTUP SCRIPT (Linux / macOS / Git Bash)
# ==============================================================================

set -euo pipefail

echo "=============================================================================="
echo "                     CIVIL CONNECTION - STARTUP"
echo "               Conectando ideias, construindo o futuro"
echo "=============================================================================="
echo

java_major() {
    local version major
    version=$("$1" -version 2>&1 | sed -n 's/.*version "\([^"]*\)".*/\1/p' | head -n 1)
    major=${version%%.*}

    if [[ "$major" == "1" ]]; then
        major=${version#1.}
        major=${major%%.*}
    fi

    printf '%s' "$major"
}

is_supported_java() {
    local major
    major=$(java_major "$1")
    [[ "$major" =~ ^[0-9]+$ ]] && (( major >= 17 && major <= 22 ))
}

java_candidates=()
if [[ -n "${JAVA_HOME:-}" ]]; then
    java_candidates+=("$JAVA_HOME/bin/java")
fi

if [[ "$(uname -s)" == "Darwin" ]] && command -v /usr/libexec/java_home >/dev/null 2>&1; then
    java_candidates+=("$(/usr/libexec/java_home -v 21 2>/dev/null || true)/bin/java")
fi

java_candidates+=(
    "/usr/lib/jvm/java-21-openjdk/bin/java"
    "/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
    "/usr/lib/jvm/jdk-21/bin/java"
)

if command -v java >/dev/null 2>&1; then
    java_candidates+=("$(command -v java)")
fi

JAVA_BIN=""
for candidate in "${java_candidates[@]}"; do
    if [[ -n "$candidate" && -x "$candidate" ]] && is_supported_java "$candidate"; then
        JAVA_BIN="$candidate"
        break
    fi
done

if [[ -z "$JAVA_BIN" ]]; then
    echo "[ERRO] Este projeto requer um JDK entre as versoes 17 e 22 para o Gradle 8.8."
    echo "Instale o JDK 21 LTS ou defina JAVA_HOME para ele."
    echo "Exemplo Debian/Ubuntu: sudo apt install openjdk-21-jdk"
    exit 1
fi

export JAVA_HOME
JAVA_HOME=$(cd "$(dirname "$JAVA_BIN")/.." && pwd)
export PATH="$JAVA_HOME/bin:$PATH"

echo "Usando Java $(java_major "$JAVA_BIN") em $JAVA_HOME"
echo "Iniciando backend Spring Boot (porta 8080)..."
echo "Acesse http://localhost:8080 no seu navegador."
echo "Pressione Ctrl+C para encerrar."
echo

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR/backend"
chmod +x ./gradlew
exec ./gradlew bootRun
