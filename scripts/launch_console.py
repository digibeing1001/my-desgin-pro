#!/usr/bin/env python3
"""
Launch Graphic Design Pro Console (static file server)

Usage:
    python scripts/launch_console.py [--port 3005] [--no-open]

Serves the built console/dist/ directory over HTTP.
Console must be built first: cd console && npm run build
"""
import argparse
import os
import sys
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver
import threading
import webbrowser

# Fix Windows terminal encoding for emoji output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')


def find_dist_dir():
    """Find console/dist directory relative to script location."""
    script_dir = Path(__file__).parent.resolve()
    skill_dir = script_dir.parent
    dist_dir = skill_dir / "console" / "dist"
    if dist_dir.exists() and (dist_dir / "index.html").exists():
        return dist_dir
    # Fallback: search up from CWD
    cwd = Path.cwd()
    for parent in [cwd] + list(cwd.parents):
        dist = parent / "console" / "dist"
        if dist.exists() and (dist / "index.html").exists():
            return dist
    return None


class QuietHandler(SimpleHTTPRequestHandler):
    """Suppress request logs for cleaner output."""

    def log_message(self, format, *args):
        pass


def get_available_port(start_port, max_attempts=10):
    """Find an available port, starting from start_port."""
    for offset in range(max_attempts):
        port = start_port + offset
        try:
            with socketserver.TCPServer(("", port), QuietHandler) as test_server:
                test_server.server_close()
                return port
        except OSError:
            continue
    return None


def main():
    parser = argparse.ArgumentParser(description="Launch Graphic Design Pro Console")
    parser.add_argument("--port", type=int, default=3005, help="Server port (default: 3005)")
    parser.add_argument("--no-open", action="store_true", help="Don't open browser automatically")
    args = parser.parse_args()

    dist_dir = find_dist_dir()
    if not dist_dir:
        print("❌ Error: console/dist/index.html not found.", file=sys.stderr)
        print("   Please build the console first:", file=sys.stderr)
        print("   cd console && npm install && npm run build", file=sys.stderr)
        sys.exit(1)

    os.chdir(dist_dir)

    port = get_available_port(args.port)
    if port is None:
        print(f"❌ Error: Could not find an available port starting from {args.port}", file=sys.stderr)
        sys.exit(1)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), QuietHandler) as httpd:
        url = f"http://localhost:{port}"
        print(f"\n🎨 Graphic Design Pro Console")
        print(f"   Serving: {dist_dir}")
        print(f"   URL:     {url}")
        print(f"   Press Ctrl+C to stop\n")

        if not args.no_open:
            threading.Timer(0.5, lambda: webbrowser.open(url)).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Console server stopped.")


if __name__ == "__main__":
    main()
