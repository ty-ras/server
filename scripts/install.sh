#!/bin/sh

. 'scripts/preamble.sh'

yarn install "$@"

cp .eslintrc.library.cjs "${TYRAS_LIB_DIR}/.eslintrc.cjs"
cp .eslintrc.output.cjs "${TYRAS_LIB_DIR}"
cp tsconfig.library.json "${TYRAS_LIB_DIR}/tsconfig.json"
cp tsconfig.build.json "${TYRAS_LIB_DIR}"