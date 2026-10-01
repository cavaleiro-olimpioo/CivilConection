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
if [[ -n "${JAVA_HOME:-}" ]] && [[ -x "$JAVA_HOME/bin/java" ]]; then
    java_candidates+=("$JAVA_HOME/bin/java")
fi

if [[ "$(uname -s)" == "Darwin" ]] && command -v /usr/libexec/java_home >/dev/null 2>&1; then
    java_candidates+=("$(/usr/libexec/java_home -v 17 2>/dev/null || /usr/libexec/java_home -v 21 2>/dev/null || /usr/libexec/java_home -v 22 2>/dev/null || true)/bin/java")
fi

java_candidates+=(
    "/usr/lib/jvm/java-17-openjdk/bin/java"
    "/usr/lib/jvm/java-17-openjdk-amd64/bin/java"
    "/usr/lib/jvm/java-21-openjdk/bin/java"
    "/usr/lib/jvm/java-21-openjdk-amd64/bin/java"
    "/usr/lib/jvm/jdk-17/bin/java"
    "/usr/lib/jvm/jdk-21/bin/java"
)

if command -v java >/dev/null 2>&1; then
    java_cmd=$(command -v java)
    if [[ "$java_cmd" != *"Common Files"*"Java"*"javapath"* ]] && [[ -x "$java_cmd" ]]; then
        java_candidates+=("$java_cmd")
    fi
fi

JAVA_BIN=""
for candidate in "${java_candidates[@]}"; do
    if [[ -n "$candidate" && -x "$candidate" ]] && is_supported_java "$candidate"; then
        JAVA_BIN="$candidate"
        break
    fi
done

if [[ -z "$JAVA_BIN" ]]; then
    echo "[ERRO] Este projeto requer um JDK 17 ou superior (compatvel com o Gradle 8.8)."
    echo "Instale um JDK 17/21/22 e defina JAVA_HOME para a pasta raiz do JDK."    exit 1
fi

export JAVA_HOME
JAVA_HOME=$(cd "$(dirname "$JAVA_BIN")/.." && pwd)
export PATH="$JAVA_HOME/bin:$PATH"

SERVER_PORT=8080
for port in 8080 8081 8082 8083 8084 8085 8086 8087 8088 8089 8090; do
    if ! (command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1) && \
       ! (command -v ss >/dev/null 2>&1 && ss -ltn | grep -q ":$port "); then
        SERVER_PORT="$port"
        break
    fi
done

export SERVER_PORT

echo "Usando Java $(java_major "$JAVA_BIN") em $JAVA_HOME"
echo "Iniciando backend Spring Boot (porta $SERVER_PORT)..."
echo "Acesse http://localhost:$SERVER_PORT no seu navegador."
echo "Pressione Ctrl+C para encerrar."
echo

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR/backend"
chmod +x ./gradlew
exec ./gradlew bootRun