"""Check the locked music edit and native playback from the built film page."""
import hashlib
import json
import shutil
import subprocess
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright
from RangeHTTPServer import RangeRequestHandler

public = Path(__file__).resolve().parents[1] / 'public'
asset = public / 'film/assets/one-last-ride-motion-preview.mp4'
assert hashlib.sha256(asset.read_bytes()).hexdigest() == 'ddd2d44c6d58b114cceb523fea47dfce9fbe3259a449a3ce8e61d8b5b002798f'
probe = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,width,height:format=duration',
    '-of', 'json', str(asset),
]))
assert float(probe['format']['duration']) == 39
assert [s['codec_name'] for s in probe['streams']] == ['h264', 'aac']
assert (probe['streams'][0]['width'], probe['streams'][0]['height']) == (1280, 720)

with ThreadingHTTPServer(('127.0.0.1', 0), partial(RangeRequestHandler, directory=str(public))) as server:
    Thread(target=server.serve_forever, daemon=True).start()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=shutil.which('google-chrome') or shutil.which('chromium'))
        for width, height in [(390, 844), (1440, 900)]:
            page = browser.new_page(viewport={'width': width, 'height': height})
            page.route('https://**/*', lambda route: route.abort())
            page.goto(f'http://127.0.0.1:{server.server_port}/one-last-ride.html', wait_until='domcontentloaded')
            page.get_by_role('link', name='Watch the 39-second teaser', exact=False).click()
            video = page.locator('#watch video')
            expect(video).to_be_visible()
            page.wait_for_function("document.querySelector('#watch video').readyState >= 1")
            assert video.evaluate('v => v.duration === 39 && v.paused && !v.muted && v.controls && v.playsInline')
            src = video.evaluate('v => v.currentSrc')
            assert src == video.locator('a').evaluate('a => a.href')
            assert urlsplit(src).query == 'v=ddd2d44c'
            video.evaluate('v => v.play()')
            page.wait_for_function("document.querySelector('#watch video').currentTime > 0.2")
            video.evaluate('v => { v.currentTime = 38.5 }')
            page.wait_for_function("document.querySelector('#watch video').ended", timeout=15000)
            assert video.evaluate('v => !v.error && v.videoWidth === 1280 && v.webkitAudioDecodedByteCount > 0')
            page.close()
        browser.close()
    server.shutdown()
