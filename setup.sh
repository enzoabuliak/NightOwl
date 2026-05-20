#!/bin/bash
set -e

cd "$(dirname "$0")"

echo ""
echo "  🦉  NightOwl — setup"
echo "  ─────────────────────────"
echo ""

if ! command -v python3 &>/dev/null; then
    echo "  ✗  Python 3 not found."
    echo "     Install from https://python.org and try again."
    exit 1
fi
echo "  ✓  Python found:  $(python3 --version)"

if [ ! -d "venv" ]; then
    echo "  ·  Creating virtual environment..."
    python3 -m venv venv
fi
echo "  ✓  Virtual environment ready"

echo "  ·  Installing dependencies..."
venv/bin/pip install --quiet --upgrade pip
venv/bin/pip install --quiet -r requirements.txt
echo "  ✓  Dependencies installed"

echo ""
echo "  Done. To launch:"
echo ""
echo "      bash launch.sh"
echo ""
