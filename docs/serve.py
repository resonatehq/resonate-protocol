"""Static server for the diagram pages, with caching turned off.

python's http.server sends no cache headers, so browsers fall back to
heuristic caching and keep serving a stale diagram.js after an edit.
"""
import functools, http.server, os, sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    port = int(os.environ.get("PORT") or (sys.argv[1] if len(sys.argv) > 1 else 8099))
    handler = functools.partial(NoCache, directory=os.path.dirname(os.path.abspath(__file__)))
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
