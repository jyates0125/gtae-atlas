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
print("PASS Atlas 33.8: revision-null/mismatch, exact match, wrong-origin redirect and offline fail closed")
