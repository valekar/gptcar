import re,json,math
from pathlib import Path
root=Path('comparisons/teardown/assets');raw=(root/'corne-cherry.kicad_pcb').read_text();segments=[]
for m in re.finditer(r'\(gr_(line|arc|curve)\b',raw):
 st=m.start();lev=0;end=st
 for j in range(st,len(raw)):
  if raw[j]=='(':lev+=1
  elif raw[j]==')':
   lev-=1
   if lev==0:end=j+1;break
 s=raw[st:end]
 if '"Edge.Cuts"'not in s:continue
 kind=m.group(1)
 if kind=='curve':
  ps=[tuple(map(float,q))for q in re.findall(r'\(xy ([-\d.]+) ([-\d.]+)\)',s)]
  if len(ps)!=4:continue
  pts=[]
  for n in range(13):
   t=n/12;u=1-t;pts.append([u**3*ps[0][k]+3*u*u*t*ps[1][k]+3*u*t*t*ps[2][k]+t**3*ps[3][k] for k in [0,1]])
 else:
  ps={k:tuple(map(float,z.groups()))for k in ['start','mid','end']if(z:=re.search(r'\('+k+r' ([-\d.]+) ([-\d.]+)\)',s))}
  if kind=='line':pts=[ps['start'],ps['end']]
  else:
   a,b,c=ps['start'],ps['mid'],ps['end'];ax,ay=a;bx,by=b;cx,cy=c;den=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));ux=((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/den;uy=((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/den;aa,bb,cc=[math.atan2(p[1]-uy,p[0]-ux)for p in [a,b,c]];sweep=(cc-aa)%(2*math.pi)
   if (bb-aa)%(2*math.pi)>sweep:sweep-=2*math.pi
   radius=math.dist(a,(ux,uy));pts=[[ux+radius*math.cos(aa+sweep*n/12),uy+radius*math.sin(aa+sweep*n/12)]for n in range(13)]
 segments.append(pts)
from PIL import Image,ImageDraw
W,H=2800,2300;ppm=20;ox,oy=-142,-34
im=Image.new('RGB',(5680,H),'white');draw=ImageDraw.Draw(im)
for seg in segments:draw.line([((a-ox)*ppm,(b-oy)*ppm)for a,b in seg],fill='black',width=3)
ImageDraw.floodfill(im,((int((-90-ox)*ppm)),int((10-oy)*ppm)),(210,80,20),thresh=1)
# Keep only the bounded region containing the known board switch centre.
mask=Image.new('L',(W,H),0);mi=mask.load();ii=im.load();count=0
for y in range(H):
 for x in range(W):
  if ii[x,y]==(210,80,20):mi[x,y]=255;count+=1
print('filled',count,'border',im.getpixel((0,0)))
assert im.getpixel((0,0)) != (210,80,20), 'flood must remain bounded' 
mask.save(root/'board-mask.png')
board=Image.new('RGBA',(W,H),(17,70,68,0));board.putalpha(mask);a=ImageDraw.Draw(board)
# Actual source copper segments, not an invented circuit.
for m in re.finditer(r'\(segment\s+\(start ([-\d.]+) ([-\d.]+)\)\s+\(end ([-\d.]+) ([-\d.]+)\)\s+\(width ([-\d.]+)\)\s+\(layer "([^"]+)"\)',raw):
 ax,ay,bx,by,ww=map(float,m.groups()[:5]);layer=m.group(6)
 if ax<0 and bx<0 and layer=='F.Cu':a.line([((ax-ox)*ppm,(ay-oy)*ppm),((bx-ox)*ppm,(by-oy)*ppm)],fill=(83,139,118,255),width=max(1,int(ww*ppm)))
layout=json.loads((root/'pcb-layout.json').read_text())
for sw in layout['switches']:
 x=(sw['x']-ox)*ppm;y=(sw['y']-oy)*ppm
 for dx,dy in [(-3.81,-2.54),(2.54,-5.08)]:
  cx=x+dx*ppm;cy=y+dy*ppm;a.ellipse((cx-ppm,cy-ppm,cx+ppm,cy+ppm),fill=(176,156,98,255));a.ellipse((cx-ppm*.45,cy-ppm*.45,cx+ppm*.45,cy+ppm*.45),fill=(23,30,30,255))
board.putalpha(mask);board.save(root/'board-front.png')
(root/'texture-frame.json').write_text(json.dumps({'origin_mm':[ox,oy],'width_mm':W/ppm,'height_mm':H/ppm,'pixels_per_mm':ppm,'mask_method':'flood fill bounded source Edge.Cuts, all gr_line/gr_arc/gr_curve, 3px raster stroke at20px/mm'}))
loops=[]
while segments:
 path=list(segments.pop());closed=False
 for _ in range(500):
  if math.dist(path[-1],path[0])<.001:closed=True;break
  found=None
  for i,p in enumerate(segments):
   if math.dist(path[-1],p[0])<.001:found=(i,p);break
   if math.dist(path[-1],p[-1])<.001:found=(i,list(reversed(p)));break
  if found is None:break
  i,p=found;segments.pop(i);path.extend(p[1:])
 if closed:loops.append(path)
 else:print('open',len(path),path[0],path[-1])
def area(p):return abs(sum(p[k][0]*p[k+1][1]-p[k+1][0]*p[k][1]for k in range(len(p)-1))/2)
loops.sort(key=area,reverse=True);print('loops',len(loops),'areas',[round(area(p),2)for p in loops]);(root/'outline.json').write_text(json.dumps({'method':'KiCad gr_line, gr_arc and cubic gr_curve on Edge.Cuts; closed paths, left panel retained; curves sampled 12 segments','loops':loops}))
