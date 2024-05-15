#!/bin/bash

# Determine the OS type
OS_TYPE=$(uname)

# Execute the appropriate binary based on OS type
if [ "$OS_TYPE" = "Linux" ]; then
    ./docker/cli-linux "$@"
elif [ "$OS_TYPE" = "Darwin" ]; then
    ./docker/cli-darwin "$@"
else
    echo "Unsupported OS type: $OS_TYPE"
    exit 1
fi
