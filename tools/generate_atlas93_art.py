#!/usr/bin/env python3
"""Original vector cityscape accents. Scalable SVG, no external-game art reuse."""
from pathlib import Path
import random,html
ROOT=Path(__file__).resolve().parent.parent; ART=ROOT/'art';ART.mkdir(exist_ok=True)
worlds={
'atlas93-gta-online':'LOS SANTOS ONLINE', 'atlas93-leonida':'LEONIDA RESEARCH','atlas93-los-santos':'LOS SANTOS','atlas93-cayo':'CAYO PERICO', 'atlas93-sa':'SAN ANDREAS', 'atlas93-heists':'HEIST INTELLIGENCE','atlas93-liberty':'LIBERTY CITY'}
heists=['agency-vip','auto-shop','cayo-perico','cluckin-bell','diamond-casino','doomsday-act-1','doomsday-act-2','doomsday-act-3','fleeca','humane-labs','kortz-center','pacific-standard','prison-break','salvage-yard','series-a']
for name in heists:worlds['atlas93-heist-'+name]=name.upper().replace('-',' ')
for n,(slug,label) in enumerate(worlds.items()):
 rand=random.Random(n+930);orange=['#ffad56','#f78f45','#ffd278'][n%3];magenta=['#ff4ac8','#b760fd','#fb63c0'][n%3];
 stars=''.join(f'<circle cx="{rand.randrange(900,3800)}" cy="{rand.randrange(15,420)}" r="{rand.choice([1,2,3])}" fill="white" opacity="{rand.randrange(2,9)/10}"/>' for _ in range(85))
 skyline='';x=700
 while x<3840:
  w=rand.randint(40,120);h=rand.randint(90,450);c=rand.choice(['#231335','#291444','#451a4d','#1a1535']);skyline+=f'<rect x="{x}" y="{1120-h}" width="{w}" height="{h}" fill="{c}" stroke="{magenta}" stroke-opacity=".3" stroke-width="3"/>'
  for row in range(1,int(h//37)):
   for col in range(1,int(w//23)):
    if rand.random()<.55: skyline+=f'<rect x="{x+col*21}" y="{1120-h+row*29}" width="7" height="13" fill="{orange}" opacity=".65"/>'
  x+=w+rand.randint(8,28)
 palm='';
 for pos in [850,3550]:
  direction=1 if pos==850 else -1
  palm+=f'<path d="M{pos} 1200 Q{pos+direction*90} 670 {pos+direction*15} 380" stroke="#090b20" stroke-width="35" fill="none"/>'
  for j in range(-3,4):palm+=f'<path d="M{pos+direction*15} 380 Q{pos+direction*(160+j*28)} {230+abs(j)*35} {pos+direction*(160+j*130)} {340+abs(j)*65}" fill="none" stroke="#090b20" stroke-width="{27-abs(j)*3}"/>'
 content=f'''<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="1280" viewBox="0 0 3840 1280" role="img" aria-label="Team Jura original {html.escape(label)} cyberpunk world artwork"><defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#130821"/><stop offset=".38" stop-color="#381047"/><stop offset=".72" stop-color="{magenta}"/><stop offset="1" stop-color="{orange}"/></linearGradient><linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2c1249"/><stop offset="1" stop-color="#0b0c23"/></linearGradient><radialGradient id="sun"><stop stop-color="#ffe4b7"/><stop offset="1" stop-color="{orange}"/></radialGradient></defs>
 <rect width="3840" height="1280" fill="url(#sky)"/>{stars}<circle cx="2740" cy="540" r="195" fill="url(#sun)" opacity=".8"/><path d="M0 950 L460 570 820 930 1160 430 1640 1000 2120 530 2660 990 3070 480 3620 970 3840 640 V1280 H0Z" fill="#271438" opacity=".85"/><path d="M0 1100 Q900 985 1700 1120 T3840 1080 V1280 H0Z" fill="url(#bottom)"/>{skyline}{palm}<path d="M0 1190 Q900 1140 1550 1190 T3840 1160" fill="none" stroke="{orange}" stroke-width="9" opacity=".42"/><path d="M0 1270 Q700 1190 1450 1240 T3840 1220" fill="none" stroke="{magenta}" stroke-width="7" opacity=".65"/></svg>'''
 (ART/(slug+'.svg')).write_text(content,encoding='utf-8')
print('Generated',len(worlds),'unique scalable hero artworks')
