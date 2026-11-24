#!/usr/bin/env python3
"""Create a NEW private, original-music action teaser from the locked 39s master.
No external samples, music, imagery or voice. Never overwrite the source.
"""
import hashlib,json,math,subprocess,wave
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'film/assets/one-last-ride-motion-preview.mp4'
OUT=ROOT/'qa-evidence/film-action'
SR=48000; DURATION=39; BPM=132; BEAT=60/BPM
LOCK='ddd2d44c6d58b114cceb523fea47dfce9fbe3259a449a3ce8e61d8b5b002798f'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(args):
    return subprocess.check_output(args,stderr=subprocess.STDOUT)
def probe(p):
    return json.loads(run(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','json',str(p)]))
def music(path):
    rng=np.random.default_rng(3904)
    total=SR*DURATION
    mix=np.zeros((total,2),dtype=np.float64)
    def place(start,signal,pan=0):
        start=int(start*SR)
        if start>=total:return
        if start<0:return
        count=min(len(signal),total-start)
        mix[start:start+count,0]+=signal[:count]*math.sqrt((1-pan)/2)
        mix[start:start+count,1]+=signal[:count]*math.sqrt((1+pan)/2)
    def tone(seconds,f,kind='pulse'):
        t=np.arange(int(seconds*SR))/SR
        if kind=='pulse':
            sig=sum(np.sin(2*np.pi*f*k*t)/(k**1.35) for k in (1,2,3,5))
        else:
            sig=(np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*f*2.003*t)+.18*np.sin(2*np.pi*f*3*t))
        return t,sig
    def env(t,attack,release):
        return np.minimum(1,t/max(attack,.001))*np.exp(-t/release)
    # Original dark minor progression; tightly synced drums, bass, arpeggios,
    # synthetic orchestral stabs and rising energy. No recognizable composition.
    roots=[45,41,48,43]
    hz=lambda note:440*2**((note-69)/12)
    for b in range(math.ceil(DURATION/BEAT)):
        s=b*BEAT; bar=b//4; beat=b%4
        root=roots[(bar//2)%len(roots)]
        energy=min(1,.69+.012*b)
        # Kick: sweeping low-end transient and subtle click
        t=np.arange(int(.30*SR))/SR
        kick=np.sin(2*np.pi*(48*t+10*(1-np.exp(-45*t))))*np.exp(-t*18)
        kick+=.14*rng.standard_normal(len(t))*np.exp(-t*220)
        place(s,.32*energy*kick)
        if beat in (1,3):
            t=np.arange(int(.19*SR))/SR
            n=rng.standard_normal(len(t));n=np.r_[n[0],np.diff(n)]
            snare=.55*n*np.exp(-t*21)+.35*np.sin(2*np.pi*175*t)*np.exp(-t*28)
            place(s,.17*energy*snare,.12 if beat==1 else -.12)
        for sub in range(4):
            pos=s+sub*BEAT/4
            t=np.arange(int(.06*SR))/SR
            n=rng.standard_normal(len(t));n=np.r_[n[0],np.diff(n)]
            place(pos,n*np.exp(-t*95)*(.019 if sub%2 else .038)*energy,(-.55 if sub%2 else .55))
        for sub in (0,1,2):
            pos=s+sub*BEAT/3
            note=root-12+(0 if sub<2 else 7)
            t,sig=tone(BEAT*.29,hz(note),'pulse')
            place(pos,.16*energy*sig*env(t,.009,.08))
        # Octave arpeggios, moving across stereo, never derived from existing music.
        for sub in range(2):
            note=root+12+[0,7,12,3,7,12,15,7][(b*2+sub)%8]
            t,sig=tone(BEAT*.43,hz(note),'soft')
            place(s+sub*BEAT/2,.052*energy*sig*env(t,.006,.13),-.35 if sub==0 else .35)
        if beat==0:
            t=np.arange(int(BEAT*3.7*SR))/SR
            chord=sum(np.sin(2*np.pi*hz(root+12+k)*t+.14*np.sin(2*np.pi*5*t)) for k in [0,3,7])
            swell=np.minimum(1,t/.07)*np.minimum(1,(t[-1]-t)/.17)
            place(s,.041*energy*chord*swell,.05)
        if beat in (0,2):
            t,sig=tone(BEAT*.68,hz(root+7),'pulse')
            place(s,.092*energy*sig*env(t,.02,.19),.2)
    # Sharp, original cinematic impacts at cold open and scene beats.
    for pos in (0,4,8,14,18,22,27,32,36):
        t=np.arange(int(.65*SR))/SR
        low=np.sin(2*np.pi*(42*t+6*(1-np.exp(-28*t))))*np.exp(-8*t)
        noise=rng.standard_normal(len(t))*np.exp(-14*t)
        place(pos,.22*low+.045*noise)
    # Two short build-ups around the later action transitions.
    for end in (14,22,32,36):
        t=np.arange(int(.85*SR))/SR
        n=rng.standard_normal(len(t))
        rise=np.sin(2*np.pi*(95*t+230*t*t))*(t/.85)**2
        place(end-.85,.025*n*(t/.85)**2+.035*rise)
    # Smooth limiting, final fade, and deterministic PCM master.
    mix=np.tanh(mix*1.25)
    mix[:int(.018*SR)]*=np.linspace(0,1,int(.018*SR))[:,None]
    mix[-int(.45*SR):]*=np.linspace(1,0,int(.45*SR))[:,None]
    peak=float(np.max(np.abs(mix)));mix*=.90/max(peak,.001)
    rms=float(np.sqrt(np.mean(mix**2)))
    assert .06<rms<.45 and np.max(np.abs(mix))<=.901
    with wave.open(str(path),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
        w.writeframes((mix*32767).astype('<i2').tobytes())
    return {'bpm':BPM,'durationSeconds':DURATION,'peak':float(np.max(np.abs(mix))),'rms':rms}
def main():
    assert sha(SOURCE)==LOCK,'Wrong locked source master'
    OUT.mkdir(parents=True,exist_ok=True)
    score=OUT/'one-last-ride-original-action-score.wav'
    stats=music(score)
    target=OUT/'one-last-ride-39s-action-review.mp4'
    # Owner explicitly requested the old opening picture removed. Replace the
    # original 0–4s with the existing dock rescue action beat at 22–26s.
    # All original footage from 4s to 39s stays in order; no voice is embedded.
    # The replacement opening requires visual/voice-timing review.
    run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(SOURCE),'-i',str(score),
         '-filter_complex','[0:v]trim=start=22:end=26,setpts=PTS-STARTPTS[a];[0:v]trim=start=4:end=39,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]',
         '-map','[v]','-map','1:a:0','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t','39','-movflags','+faststart',str(target)])
    p=probe(target)
    assert abs(float(p['format']['duration'])-39)<.12,p
    assert [s['codec_name'] for s in p['streams']]==['h264','aac'],p
    assert (p['streams'][0]['width'],p['streams'][0]['height'])==(1280,720)
    for label,second in [('new-opening',.2),('after-opening',4.4),('action-middle',22.3)]:
        run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(second),'-i',str(target),'-frames:v','1',str(OUT/(label+'.jpg'))])
    assert sha(SOURCE)==LOCK,'Source was modified'
    manifest={'reviewOnly':True,'runtimeSeconds':39,'sourceSha256':LOCK,'outputSha256':sha(target),'scoreSha256':sha(score),'score':stats,'opening':'Existing 22–26s dock action replaces original 0–4s; original 4–39s retained. First shot and score require owner visual/listening approval. No dialogue, no third-party samples.','disclosure':'Original concept motion teaser, not finished feature animation. Original score replaces the prior combined score/FX track; final separate foley/voices remain open.'}
    (OUT/'ACTION-REVIEW-MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps(manifest,indent=2))
if __name__=='__main__':main()
