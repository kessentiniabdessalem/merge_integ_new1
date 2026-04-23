#!/bin/sh
set -e

INTEGRATED_DIR="$(cd "$(dirname "$0")" && pwd)"
M2_CACHE="$HOME/.m2"
BUILDER_IMAGE="maven-builder"

SERVICES="event-service payment-service certificate-service quiz-feedback-service ai-service course-service user-service eureka-server api-gateway job-service"

# Build the cached builder image once if it doesn't exist
if ! docker image inspect "$BUILDER_IMAGE" > /dev/null 2>&1; then
  echo "==> Building maven-builder image (one-time setup)..."
  docker build -t maven-builder - <<'EOF'
FROM eclipse-temurin:17-jdk-alpine
RUN apk add --no-cache maven
EOF
  echo "==> maven-builder image ready"
else
  echo "==> maven-builder image already exists, skipping build"
fi

for svc in $SERVICES; do
  echo ""
  echo "==> Building $svc ..."
  docker run --rm \
    -v "$INTEGRATED_DIR/$svc":/app \
    -v "$M2_CACHE":/root/.m2 \
    -w /app \
    "$BUILDER_IMAGE" \
    sh -c "mvn clean package -DskipTests --no-transfer-progress"
  echo "==> $svc JAR built successfully"
done

echo ""
echo "==> All JARs built. Run: docker compose up --build"
