#!/usr/bin/env python3
"""
Launch Graphic Design Pro Console (static file server + Gateway proxy)

Usage:
    python scripts/launch_console.py [--port 3005] [--no-open]

Serves the built console/dist/ directory over HTTP.
Acts as a reverse proxy to Agent Gateways at /proxy/{env}/* to bypass CORS.
Console must be built first: cd console && npm run build
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import socketserver
import threading
import webbrowser
import base64
import re

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


def get_available_port(start_port, max_attempts=10):
    """Find an available port, starting from start_port."""
    for offset in range(max_attempts):
        port = start_port + offset
        try:
            with socketserver.TCPServer(("", port), SimpleHTTPRequestHandler) as test_server:
                test_server.server_close()
                return port
        except OSError:
            continue
    return None


def get_parent_process_names():
    """Get parent process names using PowerShell (Windows)."""
    try:
        result = subprocess.run(
            [
                "powershell",
                "-NoProfile",
                "-Command",
                f"""
                $pid = {os.getpid()};
                $names = @();
                for ($i = 0; $i -lt 5; $i++) {{
                    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue;
                    if (-not $proc) {{ break; }}
                    $parent = Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.ParentProcessId)" -ErrorAction SilentlyContinue;
                    if (-not $parent) {{ break; }}
                    $names += $parent.Name;
                    $pid = $parent.ProcessId;
                    if ($pid -le 4) {{ break; }}
                }};
                $names -join ','
                """,
            ],
            capture_output=True,
            text=True,
            timeout=10,
        )
        names = result.stdout.strip().lower().split(",")
        return [n.strip() for n in names if n.strip()]
    except Exception:
        return []


def discover_all_agents():
    """
    Discover all configured and running Agent gateways.
    Returns a list of dicts: [{env, gateway_url, gateway_token, status}, ...]
    status: 'running' | 'configured'
    """
    home = Path.home()
    agents = []
    seen_urls = {}

    # Helper to check health
    def check_health(url):
        try:
            req = urllib.request.Request(
                f"{url}/health", method="GET", headers={"Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status == 200
        except Exception:
            return False

    # OpenClaw
    oc_cfg_path = home / ".openclaw" / "openclaw.json"
    if oc_cfg_path.exists():
        try:
            oc_cfg = json.loads(oc_cfg_path.read_text(encoding="utf-8"))
            port = oc_cfg.get("gateway", {}).get("port", 18789)
            auth = oc_cfg.get("gateway", {}).get("auth", {})
            token = auth.get("token") if auth.get("mode") == "token" else None
            url = f"http://127.0.0.1:{port}"
            is_running = check_health(url)
            seen_urls[url] = {"env": "openclaw", "gateway_url": url, "gateway_token": token, "status": "running" if is_running else "configured"}
        except Exception:
            pass

    # WorkBuddy (shares OpenClaw gateway, but shown as separate option)
    if oc_cfg_path.exists():
        try:
            oc_cfg = json.loads(oc_cfg_path.read_text(encoding="utf-8"))
            port = oc_cfg.get("gateway", {}).get("port", 18789)
            auth = oc_cfg.get("gateway", {}).get("auth", {})
            token = auth.get("token") if auth.get("mode") == "token" else None
            url = f"http://127.0.0.1:{port}"
            is_running = check_health(url)
            seen_urls[url] = {"env": "workbuddy", "gateway_url": url, "gateway_token": token, "status": "running" if is_running else "configured"}
        except Exception:
            pass

    # QClaw
    qc_cfg_path = home / ".qclaw" / "openclaw.json"
    qc_meta_path = home / ".qclaw" / "qclaw.json"
    if qc_cfg_path.exists():
        try:
            qc_cfg = json.loads(qc_cfg_path.read_text(encoding="utf-8"))
            port = qc_cfg.get("gateway", {}).get("port", 28789)
            auth = qc_cfg.get("gateway", {}).get("auth", {})
            token = auth.get("token") if auth.get("mode") == "token" else None
            url = f"http://127.0.0.1:{port}"
            is_running = check_health(url)
            if url not in seen_urls:
                seen_urls[url] = {"env": "qclaw", "gateway_url": url, "gateway_token": token, "status": "running" if is_running else "configured"}
        except Exception:
            pass
    elif qc_meta_path.exists():
        try:
            meta = json.loads(qc_meta_path.read_text(encoding="utf-8"))
            port = meta.get("port", 28789)
            url = f"http://127.0.0.1:{port}"
            is_running = check_health(url)
            if url not in seen_urls:
                seen_urls[url] = {"env": "qclaw", "gateway_url": url, "gateway_token": None, "status": "running" if is_running else "configured"}
        except Exception:
            pass

    # Gather parent process names to mark the launcher
    parents = get_parent_process_names()
    parent_str = " ".join(parents)
    launcher_env = None
    if "workbuddy.exe" in parent_str or "workbuddy" in parent_str:
        launcher_env = "workbuddy"
    elif "qclaw.exe" in parent_str or "qclaw" in parent_str:
        launcher_env = "qclaw"
    elif "openclaw.exe" in parent_str or "openclaw" in parent_str:
        launcher_env = "openclaw"

    # Build agents list from unique URLs
    for url, info in seen_urls.items():
        if launcher_env and info["env"] == launcher_env:
            info["preferred"] = True
        agents.append(info)

    # Sort: preferred first, then running, then others
    agents.sort(key=lambda a: (not a.get("preferred", False), a["status"] != "running", a["env"]))
    return agents


def discover_models_from_config():
    """
    Read actual model configurations from OpenClaw/WorkBuddy config.
    Returns {llm: [...], image: [...], defaults: {llm: str|None, image: str|None}}
    """
    home = Path.home()
    oc_cfg_path = home / ".openclaw" / "openclaw.json"
    if not oc_cfg_path.exists():
        return None
    try:
        cfg = json.loads(oc_cfg_path.read_text(encoding="utf-8"))
        providers = cfg.get("models", {}).get("providers", {})
        defaults = cfg.get("agents", {}).get("defaults", {}).get("model", {})
        primary = defaults.get("primary")
        fallbacks = defaults.get("fallbacks", [])

        llm_models = []
        image_models = []
        seen_ids = set()

        # Heuristic keywords for image generation models
        IMAGE_KEYWORDS = ["seed", "image", "flux", "imagen", "dall", "seedream", "picture", "drawing", "art", "generation", "sdxl", "stable-diffusion"]

        for provider_name, provider_cfg in providers.items():
            for m in provider_cfg.get("models", []):
                model_id = m.get("id", "")
                full_id = f"{provider_name}/{model_id}" if "/" not in model_id else model_id
                if full_id in seen_ids:
                    continue
                seen_ids.add(full_id)

                name = m.get("name") or model_id
                inputs = m.get("input", [])
                desc_parts = []
                if inputs:
                    desc_parts.append(", ".join(inputs))
                if m.get("reasoning"):
                    desc_parts.append("reasoning")
                desc = " · ".join(desc_parts) if desc_parts else ""

                model_entry = {
                    "id": full_id,
                    "name": name,
                    "provider": provider_name,
                    "icon": "🧠",
                    "desc": desc,
                }
                llm_models.append(model_entry)

                # Heuristic: check if model name/id suggests image generation
                lower_name = (name + " " + model_id).lower()
                if any(kw in lower_name for kw in IMAGE_KEYWORDS):
                    image_models.append({**model_entry, "icon": "🎨"})

        # Determine defaults
        default_llm = primary
        default_image = None
        # Prefer an image-heuristic model as default image model
        if image_models:
            default_image = image_models[0]["id"]

        return {
            "llm": llm_models,
            "image": image_models,
            "defaults": {"llm": default_llm, "image": default_image},
        }
    except Exception:
        return None


def inject_agents_into_html(dist_dir, agents):
    """
    Inject detected agents into index.html so Console can read them even without URL params.
    Gateway URLs are rewritten to /proxy/{env} so Console accesses them same-origin.
    """
    index_path = Path(dist_dir) / "index.html"
    if not index_path.exists():
        return
    try:
        html = index_path.read_text(encoding="utf-8")
        # Remove any previous injection
        html = re.sub(r'<script>window\.__AGENTS__ = .*?</script>\s*', '', html)
        html = re.sub(r'<script>window\.__AGENT_MAP__ = .*?</script>\s*', '', html)
        html = re.sub(r'<script>window\.__MODELS__ = .*?</script>\s*', '', html)

        # Build proxy agent list (frontend uses /proxy/{env})
        agent_map = {}
        proxy_agents = []
        for a in agents:
            agent_map[a["env"]] = a["gateway_url"]
            proxy_agents.append({
                "env": a["env"],
                "gateway_url": f"/proxy/{a['env']}",
                "gateway_token": a["gateway_token"],
                "status": a["status"],
                "preferred": a.get("preferred", False),
            })

        # Inject agent map for proxy handler
        map_json = json.dumps(agent_map)
        map_injection = f'<script>window.__AGENT_MAP__ = {map_json};</script>\n'

        # Inject proxy agent list for frontend
        agents_json = json.dumps(proxy_agents)
        agents_injection = f'<script>window.__AGENTS__ = {agents_json};</script>\n'

        # Inject actual models from OpenClaw config
        models_data = discover_models_from_config()
        models_injection = ""
        if models_data:
            models_json = json.dumps(models_data)
            models_injection = f'<script>window.__MODELS__ = {models_json};</script>\n'

        injection = map_injection + agents_injection + models_injection
        if '</head>' in html:
            html = html.replace('</head>', injection + '</head>', 1)
        elif '<body>' in html:
            html = html.replace('<body>', injection + '<body>', 1)
        index_path.write_text(html, encoding="utf-8")
    except Exception as e:
        print(f"   ⚠️  Warning: Could not inject agents into index.html: {e}", file=sys.stderr)


class ProxyHandler(SimpleHTTPRequestHandler):
    """
    Static file handler + reverse proxy to Agent Gateways at /proxy/{env}/*.
    This bypasses browser CORS restrictions by making Gateway requests same-origin.
    """

    agent_map = {}

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path.startswith('/proxy/'):
            self._proxy('GET')
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/proxy/'):
            self._proxy('POST')
        else:
            super().do_POST()

    def do_PUT(self):
        if self.path.startswith('/proxy/'):
            self._proxy('PUT')
        else:
            self.send_error(405)

    def do_PATCH(self):
        if self.path.startswith('/proxy/'):
            self._proxy('PATCH')
        else:
            self.send_error(405)

    def do_DELETE(self):
        if self.path.startswith('/proxy/'):
            self._proxy('DELETE')
        else:
            self.send_error(405)

    def do_OPTIONS(self):
        if self.path.startswith('/proxy/'):
            # Always allow CORS for proxy paths (same-origin to frontend)
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
        else:
            super().do_OPTIONS()

    def _proxy(self, method):
        # Parse /proxy/{env}/path
        parts = self.path.split('/', 3)
        if len(parts) < 3 or not parts[2]:
            self.send_error(404, "Missing agent env in proxy path")
            return
        env = parts[2]
        target_path = '/' + parts[3] if len(parts) > 3 else '/'

        gateway_url = self.agent_map.get(env)
        if not gateway_url:
            self.send_error(404, f"Unknown agent env: {env}")
            return

        target_url = f"{gateway_url}{target_path}"
        try:
            req = urllib.request.Request(target_url, method=method)
            # Copy relevant headers
            for header in ['Content-Type', 'Authorization']:
                value = self.headers.get(header)
                if value:
                    req.add_header(header, value)
            # Copy body for non-GET methods
            if method in ('POST', 'PUT', 'PATCH'):
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 0:
                    req.data = self.rfile.read(content_length)

            resp = urllib.request.urlopen(req, timeout=60)
            self.send_response(resp.status)
            for key, value in resp.headers.items():
                if key.lower() not in ('transfer-encoding', 'connection'):
                    self.send_header(key, value)
            self.end_headers()
            self.wfile.write(resp.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for key, value in e.headers.items():
                if key.lower() not in ('transfer-encoding', 'connection'):
                    self.send_header(key, value)
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            msg = str(e).encode('ascii', 'replace').decode('ascii')
            self.send_error(502, msg)


def main():
    parser = argparse.ArgumentParser(description="Launch Graphic Design Pro Console")
    parser.add_argument("--port", type=int, default=3005, help="Server port (default: 3005)")
    parser.add_argument("--no-open", action="store_true", help="Don't open browser automatically")
    parser.add_argument("--gateway", type=str, default=None, help="Gateway URL override")
    parser.add_argument("--token", type=str, default=None, help="Gateway token override")
    parser.add_argument("--env", type=str, default=None, help="Agent environment override")
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

    # Discover agents and inject into HTML before serving
    agents = discover_all_agents()
    inject_agents_into_html(dist_dir, agents)

    # Build proxy agent map
    agent_map = {}
    for a in agents:
        agent_map[a["env"]] = a["gateway_url"]
    ProxyHandler.agent_map = agent_map

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), ProxyHandler) as httpd:
        # Build base URL
        url = f"http://localhost:{port}"

        # Auto-detect or use override gateway params
        running_agents = [a for a in agents if a["status"] == "running"]

        # Determine injection strategy
        if args.gateway:
            # Manual override: inject single gateway
            params = []
            params.append(f"gateway={urllib.parse.quote(args.gateway, safe=':/')}")
            if args.token:
                params.append(f"token={urllib.parse.quote(args.token, safe='')}")
            if args.env:
                params.append(f"env={urllib.parse.quote(args.env, safe='')}")
            url = f"{url}?{'&'.join(params)}"
            print(f"\n🎨 Graphic Design Pro Console")
            print(f"   Serving: {dist_dir}")
            print(f"   Agent:   {args.env or 'unknown'} (override)")
            print(f"   Gateway: {args.gateway}")
            print(f"   URL:     {url}")
        elif len(running_agents) == 1:
            # Exactly one running agent: auto-connect via proxy path
            agent = running_agents[0]
            proxy_url = f"/proxy/{agent['env']}"
            params = []
            params.append(f"gateway={urllib.parse.quote(proxy_url, safe='/')}")
            if agent.get("gateway_token"):
                params.append(f"token={urllib.parse.quote(agent['gateway_token'], safe='')}")
            params.append(f"env={urllib.parse.quote(agent['env'], safe='')}")
            url = f"{url}?{'&'.join(params)}"
            print(f"\n🎨 Graphic Design Pro Console")
            print(f"   Serving: {dist_dir}")
            print(f"   Agent:   {agent['env']}")
            print(f"   Gateway: {agent['gateway_url']} (proxied via {proxy_url})")
            if agent.get("gateway_token"):
                mask = "*" * min(len(agent["gateway_token"]), 8)
                print(f"   Token:   {mask}")
            print(f"   URL:     {url}")
        elif len(agents) > 0:
            # Multiple agents or none running: inject proxy agents list for frontend selection
            proxy_agents = []
            for a in agents:
                proxy_agents.append({
                    "env": a["env"],
                    "gateway_url": f"/proxy/{a['env']}",
                    "gateway_token": a["gateway_token"],
                    "status": a["status"],
                    "preferred": a.get("preferred", False),
                })
            agents_payload = base64.b64encode(json.dumps(proxy_agents).encode("utf-8")).decode("utf-8")
            params = []
            params.append(f"agents={urllib.parse.quote(agents_payload, safe='')}")
            url = f"{url}?{'&'.join(params)}"
            print(f"\n🎨 Graphic Design Pro Console")
            print(f"   Serving: {dist_dir}")
            print(f"   Detected {len(agents)} agent(s):")
            for a in agents:
                status_icon = "🟢" if a["status"] == "running" else "⚪"
                pref = " ← 启动来源" if a.get("preferred") else ""
                print(f"     {status_icon} {a['env']:12} {a['gateway_url']} → /proxy/{a['env']}{pref}")
            print(f"   URL:     {url}")
        else:
            # No agents found at all
            print(f"\n🎨 Graphic Design Pro Console")
            print(f"   Serving: {dist_dir}")
            print(f"   ⚠️  未检测到任何 Agent Gateway")
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
