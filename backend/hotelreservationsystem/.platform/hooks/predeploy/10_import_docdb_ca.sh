#!/bin/bash
set -euo pipefail

echo "DOCDB: downloading global bundle"
mkdir -p /tmp
curl -fLsS https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -o /tmp/global-bundle.pem
chmod 0644 /tmp/global-bundle.pem

echo "DOCDB: locating java + cacerts"
JAVA_BIN="$(readlink -f "$(which java)")"
JAVA_HOME="$(dirname "$(dirname "$JAVA_BIN")")"
CACERTS="$JAVA_HOME/lib/security/cacerts"

echo "DOCDB: JAVA_BIN=$JAVA_BIN"
echo "DOCDB: JAVA_HOME=$JAVA_HOME"
echo "DOCDB: CACERTS=$CACERTS"

if [ ! -f "$CACERTS" ]; then
  echo "DOCDB: cacerts not found at $CACERTS"
  exit 1
fi

echo "DOCDB: splitting bundle into individual certs"
awk 'BEGIN{c=0;} /BEGIN CERTIFICATE/{c++} {print > ("/tmp/docdb-ca-" c ".pem")}' /tmp/global-bundle.pem

echo "DOCDB: importing certs into JVM truststore"
for f in /tmp/docdb-ca-*.pem; do
  alias="docdb-ca-$(basename "$f" .pem)"
  keytool -importcert -noprompt -trustcacerts \
    -alias "$alias" -file "$f" \
    -keystore "$CACERTS" -storepass changeit || true
done

rm -f /tmp/docdb-ca-*.pem
echo "DOCDB: import complete"
 