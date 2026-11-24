#!/usr/bin/env python3
"""Render a 4:15 development-only One Last Ride ANIMATIC from approved local stills.

No third-party media downloads. Existing original teaser audio is a temporary
repeated cue; the finished voiced/animated feature and permissions remain open.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SIZE = (1280, 720)
FONT = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
FONT_REGULAR = Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')

def font(size, bold=False):
    path = FONT if bold else FONT_REGULAR
    return ImageFont.truetype(str(path), size) if path.is_file() else ImageFont.load_default()

def linewrap(draw, value, chosen_font, max_width):
    lines, current = [], ''
    for word in value.split():
        candidate = (current + ' ' + word).strip()
        if current and draw.textbbox((0, 0), candidate, font=chosen_font)[2] > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines

def slide(scene, index, count, source, dest):
    with Image.open(source) as im:
        rgb = ImageOps.fit(im.convert('RGB'), SIZE, method=Image.Resampling.LANCZOS)
    overlay = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    pixels = ImageDraw.Draw(overlay)
    for y in range(720):
        top = max(0, 1 - y / 190)
        bottom = max(0, (y - 290) / 430)
        alpha = min(228, int(80 * top + 211 * bottom))
        pixels.line((0, y, 1279, y), fill=(16, 8, 27, alpha))
    rgb = Image.alpha_composite(rgb.convert('RGBA'), overlay)
    d = ImageDraw.Draw(rgb)
    d.rounded_rectangle((38, 33, 469, 80), radius=13,
                        fill=(35, 16, 52, 215), outline=(238, 176, 110, 230), width=2)
    d.text((53, 46), 'ELARIO STUDIOS  /  TEAM JURA', font=font(19, True), fill='#ffe3ad')
    d.text((970, 49), f'CHAPTER {index+1:02d} / {count:02d}', font=font(19, True), fill='#ffe4b9')
    d.line((47, 488, 1233, 488), fill=(239, 180, 111, 215), width=3)
    d.text((47, 507), scene['title'], font=font(50, True),
           fill='white', stroke_width=2, stroke_fill='#1f0c2e')
    d.text((50, 572), scene['place'].upper(), font=font(18, True), fill='#ffcb92')
    for j, line in enumerate(linewrap(d, scene['caption'], font(23), 1150)[:2]):
        d.text((50, 605+29*j), line, font=font(23), fill='#ffecf3')
    d.text((49, 685), 'STORYBOARD ANIMATIC  •  ORIGINAL FAN FICTION  •  NOT FINISHED ANIMATION',
           font=font(15, True), fill='#e5c9dc')
    d.rectangle((0, 715, int(1280*(index+1)/count), 720), fill='#ffc27c')
    rgb.convert('RGB').save(dest, 'PNG', optimize=True)

def call(args):
    proc = subprocess.run(args, capture_output=True, text=True, timeout=900)
    if proc.returncode:
        raise RuntimeError(f'{args[0]} failed ({proc.returncode}): {proc.stderr[-5000:]}')
    return proc.stdout

def render(root, output, quick=False):
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise RuntimeError('Local FFmpeg and FFprobe are required; no remote fetch permitted')
    project = json.loads((root/'film/production/CONDENSED-CUT-255S.json').read_text(encoding='utf-8'))
    scenes = project.get('chapters', [])
    if project.get('schema') != 'team-jura-olr-animatic-1' or len(scenes) != 9:
        raise ValueError('Wrong storyboard revision or chapter count')
    total=0
    for index, scene in enumerate(scenes):
        if not isinstance(scene.get('durationSeconds'), int) or not 10 <= scene['durationSeconds'] <= 60:
            raise ValueError(f'Invalid chapter duration {index+1}')
        if not all(isinstance(scene.get(f),str) and scene[f].strip() for f in ('title','place','caption')):
            raise ValueError(f'Missing original chapter label {index+1}')
        if not isinstance(scene.get('card'),int) or not 1 <= scene['card'] <= 9:
            raise ValueError('Only the nine approved on-repo concept frames are allowed')
        total += scene['durationSeconds']
    if total != 255 or project.get('runtimeSeconds') != total:
        raise ValueError('Condensed cut must total exactly 4:15')
    audio = root/'film/assets/original_teaser_score.wav'
    if not audio.is_file() or audio.stat().st_size < 2000:
        raise FileNotFoundError('Original instrumental missing; do not use third-party substitute')
    output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='jura-olr-') as tmpdir:
        tmp = Path(tmpdir)
        sequence=['ffconcat version 1.0']
        for index, scene in enumerate(scenes):
            source=root/f"film/assets/preview-card-{scene['card']:02d}.jpg"
            if not source.is_file():
                raise FileNotFoundError('Original storyboard frame missing: '+str(source))
            target=tmp/f'scene-{index+1:02}.png'
            slide(scene,index,len(scenes),source,target)
            sequence.extend([f"file '{target.as_posix()}'", 'duration '+str(2 if quick else scene['durationSeconds'])])
        sequence.append(f"file '{(tmp/'scene-09.png').as_posix()}'")
        listing=tmp/'scenes.ffconcat'
        listing.write_text('\n'.join(sequence)+'\n',encoding='utf-8')
        seconds=18 if quick else total
        cmd=['ffmpeg','-hide_banner','-loglevel','error','-nostdin','-y',
             '-safe','0','-f','concat','-i',str(listing),
             '-stream_loop','-1','-i',str(audio),
             '-map','0:v:0','-map','1:a:0',
             '-vf','fps=24,format=yuv420p',
             '-af',f'volume=0.6,afade=t=in:st=0:d=1,afade=t=out:st={max(0,seconds-3)}:d=3',
             '-c:v','libx264','-preset','veryfast','-crf','23','-r','24','-pix_fmt','yuv420p',
             '-c:a','aac','-b:a','128k','-t',str(seconds),'-movflags','+faststart',str(output)]
        call(cmd)
    probe=json.loads(call(['ffprobe','-v','quiet','-show_entries',
                           'format=duration:stream=codec_name,width,height','-of','json',str(output)]))
    duration=float(probe['format']['duration'])
    if not seconds-0.15 <= duration <= seconds+0.6:
        raise ValueError(f'Rendered runtime mismatch: {duration} vs {seconds}')
    video=[s for s in probe['streams'] if s['codec_name']=='h264']
    sound=[s for s in probe['streams'] if s['codec_name']=='aac']
    if len(video)!=1 or len(sound)!=1 or video[0]['width']!=SIZE[0] or video[0]['height']!=SIZE[1]:
        raise ValueError('Unexpected video/audio streams')
    record={'schema':'team-jura-olr-animatic-render-1','previewOnly':True,
            'notice':'Timed original still concept images; NOT a finished animated feature.',
            'chapterCount':len(scenes),'runtimeSeconds':seconds,
            'visuals':'Original repository storyboard frames',
            'audio':'Repeated original Elario teaser cue; final score outstanding',
            'output':output.name,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
            'bytes':output.stat().st_size,'durationMeasured':duration}
    output.with_suffix('.manifest.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
    return record

def main():
    parser=argparse.ArgumentParser(description='Render unfinished timed storyboard animatic')
    parser.add_argument('--root',type=Path,default=ROOT)
    parser.add_argument('--output',type=Path,default=ROOT/'qa-evidence/film/one-last-ride-415-animatic.mp4')
    parser.add_argument('--quick',action='store_true',help='2 seconds per chapter for focused testing')
    args=parser.parse_args()
    print(json.dumps(render(args.root.resolve(),args.output.resolve(),args.quick),indent=2))

if __name__=='__main__':
    main()
