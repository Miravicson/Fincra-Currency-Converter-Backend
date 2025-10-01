#!/usr/bin/env bash
# scripts/setenv.sh
ENV_FILE_DIR=src/common/configs/env

if [[ $NODE_ENV = "test" ]]; then
  ENV_FILE_DIR_PATH=$ENV_FILE_DIR/test.env
else
  ENV_FILE_DIR_PATH=$ENV_FILE_DIR/development.env
fi

echo "Env file path set to $ENV_FILE_DIR_PATH"

# Export env vars
export $(grep -v '^#' $ENV_FILE_DIR_PATH | xargs)
echo $DATABASE_URL