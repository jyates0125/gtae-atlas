"""Atlas 33.8 release verifier must fail closed without network or Cloudflare credentials."""
import importlib.util
from pathlib import Path
from unittest.mock import patch

path = Path(__file__).resolve().parent / "verify_cloudflare_dual_release.py"
spec = importlib.util.spec_from_file_location("dual_release", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
expected = "0123456789abcdef0123456789abcdef01234567"
errors = []
with patch.object(module, "fetch", return_value={"status": 200, "url": module.PRIMARY + "atlas-build-identity.json",
                                                   "body": b'{"revision":null}'}):
    module.check_identity(module.PRIMARY, expected, errors)
assert errors and "no verifiable revision" in errors[0], errors
errors = []
with patch.object(module, "fetch", return_value={"status": 200, "url": module.PRIMARY + "atlas-build-identity.json",
                                                   "body": b'{"revision":"fedcba9876543210"}'}):
    module.check_identity(module.PRIMARY, expected, errors)
assert errors and "!= expected" in errors[0], errors
errors = []
with patch.object(module, "fetch", return_value={"status": 200, "url": module.PRIMARY + "atlas-build-identity.json",
                                                   "body": ('{"revision":"' + expected + '"}').encode()}):
    identity = module.check_identity(module.PRIMARY, expected, errors)
assert not errors and identity["revision"] == expected
errors = []
with patch.object(module, "fetch", return_value={"status": 200, "url": "https://evil.example/page",
                                                   "body": b"<html>redirect</html>"}):
    module.check_page(module.PRIMARY, "maps.html", errors)
assert errors and "redirected" in errors[0], errors
errors = []
with patch.object(module, "fetch", return_value={"error": "offline"}):
    module.check_page(module.PRIMARY, "maps.html", errors)
assert errors and "inaccessible" in errors[0], errors
# Canonical production is main; retired origin remains an explicit diagnostic.
workflow = (Path(__file__).resolve().parents[1] / ".github/workflows/atlas338-dual-cloudflare-release.yml").read_text()
assert "branches: [development]" in workflow
assert "schedule:" in workflow and "push:" in workflow
assert "refs/heads/main" in workflow and "ref: development" not in workflow
assert "if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'" in workflow
assert 'if [ "$CHECK_LEGACY" = true ]; then args+=(--check-legacy); fi' in workflow
assert "--primary-only" in workflow
verifier = path.read_text()
assert "legacy_identity = check_identity(args.legacy" in verifier
assert 'identity.get("revision") != legacy_identity.get("revision")' in verifier
# Verify exact current primary succeeds alone, but unreachable legacy fails when explicitly requested.
from contextlib import redirect_stdout
from io import StringIO
def mocked_fetch(url, **kwargs):
    if url.startswith(module.LEGACY):
        return {"error": "legacy retired"}
    if url.endswith("atlas-build-identity.json"):
        return {"status": 200, "url": url, "body": ('{"revision":"' + expected + '"}').encode()}
    return {"status": 200, "url": url, "body": b"<html>map</html>"}
with patch.object(module, "fetch", side_effect=mocked_fetch), redirect_stdout(StringIO()):
    with patch("sys.argv", ["verify", "--expected-sha", expected]):
        assert module.main() == 0
    with patch("sys.argv", ["verify", "--expected-sha", expected, "--check-legacy"]):
        assert module.main() == 1
audit_path = path.with_name("audit_atlas345_cloudflare_source_boundary.py")
audit_spec = importlib.util.spec_from_file_location("boundary", audit_path)
boundary = importlib.util.module_from_spec(audit_spec)
audit_spec.loader.exec_module(boundary)
def fake_inspect(origin):
    return {"origin": origin, "errors": [] if origin == module.PRIMARY else ["retired"]}
with patch.object(boundary, "inspect", side_effect=fake_inspect) as mocked, redirect_stdout(StringIO()):
    with patch("sys.argv", ["audit", "--primary-only"]):
        assert boundary.main() == 0
    assert mocked.call_count == 1
    with patch("sys.argv", ["audit"]):
        assert boundary.main() == 1
    assert mocked.call_count == 3
print("PASS Atlas 33.8: strict identity and redirect checks, production-only default workflow, explicit fail-closed legacy diagnostic")
