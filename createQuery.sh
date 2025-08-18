#!/bin/bash

# Name of the query
QUERY_NAME="$1"
if [ -z "$QUERY_NAME" ]; then
  echo "Usage: ./createQuery.sh [QUERY_NAME]"
  exit 1
fi

# Capitalize first letter of QUERY_NAME for interface
INTERFACE_NAME="$(echo ${QUERY_NAME:0:1} | tr 'a-z' 'A-Z')${QUERY_NAME:1}"

# Generate SQL File
SQL_FILE="./queries/sql/$QUERY_NAME.sql"
cat > "$SQL_FILE" <<EOL
/* @name $QUERY_NAME */
/* @param id -> uuid */

-- Your SQL Query Here
EOL

# Generate TS File
TS_FILE="./queries/$QUERY_NAME.ts"
cat > "$TS_FILE" <<EOL
import { ${QUERY_NAME}, I${INTERFACE_NAME}Params, I${INTERFACE_NAME}Result } from './sql/${QUERY_NAME}'
import getPg from '../lib/pgPool'

export const ${QUERY_NAME}InDb = async (
  params: I${INTERFACE_NAME}Params,
): Promise<I${INTERFACE_NAME}Result> => {
  const pg = getPg()

  try {
    const result = await ${QUERY_NAME}.run(params, pg)
    return result[0]
  } catch (error: any) {
    console.error('Error executing ${QUERY_NAME} query:', error)
    throw error
  }
}
EOL

echo "Generated $SQL_FILE"
echo "Generated $TS_FILE"
