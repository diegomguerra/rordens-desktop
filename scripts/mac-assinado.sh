#!/bin/bash
# Gera o RORDENS.dmg ASSINADO (Developer ID) e NOTARIZADO pela Apple, no Mac do mantenedor.
# Lê ~/.rordens/appstore.env (chave de API do App Store Connect) e ~/.rordens/certs/devid.p12 (+ .pass). Nada disso vai para o repositório.
# Usa um chaveiro próprio e temporário (a lista de chaveiros do usuário volta ao normal no fim).
set -euo pipefail
ENVF="$HOME/.rordens/appstore.env"; C="$HOME/.rordens/certs"
for f in "$ENVF" "$C/devid.p12" "$C/devid.p12.pass" "$C/g2.cer"; do [ -s "$f" ] || { echo "FALHA: falta $f"; exit 1; }; done
set -a; . "$ENVF"; set +a
KC="$C/rordens-mac.keychain-db"; PW="$(cat "$C/devid.p12.pass")"
ORIG="$(security list-keychains -d user | tr -d '"' | tr -s ' \n' ' ')"
restaurar() { security list-keychains -d user -s $ORIG >/dev/null 2>&1 || true; security delete-keychain "$KC" >/dev/null 2>&1 || true; }
trap restaurar EXIT
security delete-keychain "$KC" >/dev/null 2>&1 || true
security create-keychain -p "$PW" "$KC"; security set-keychain-settings -lut 7200 "$KC"; security unlock-keychain -p "$PW" "$KC"
security import "$C/devid.p12" -k "$KC" -P "$PW" -T /usr/bin/codesign >/dev/null
security import "$C/g2.cer" -k "$KC" >/dev/null 2>&1 || true
security set-key-partition-list -S apple-tool:,apple: -s -k "$PW" "$KC" >/dev/null
security list-keychains -d user -s "$KC" $ORIG
unset CSC_LINK CSC_KEY_PASSWORD
export CSC_NAME="Diego Guerra (J3CXGLAV89)" CSC_KEYCHAIN="$KC"
export APPLE_API_KEY="$ASC_KEY_PATH" APPLE_API_KEY_ID="$ASC_KEY_ID" APPLE_API_ISSUER="$ASC_ISSUER_ID"
cd "$(dirname "$0")/.." && npx electron-builder --mac dmg --arm64 --publish never
