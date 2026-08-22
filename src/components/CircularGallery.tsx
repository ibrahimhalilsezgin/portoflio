'use client';
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: any;
  return function (this: any, ...args: any[]) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); };
}
function lerp(p1: number, p2: number, t: number) { return p1 + (p2 - p1) * t; }

class Title {
  mesh: any;
  constructor({ gl, plane, text, textColor = '#ffffff', font = 'bold 24px Inter' }: any) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const tw = Math.ceil(metrics.width);
    const th = Math.ceil(parseInt(font) * 1.2 || 30);
    canvas.width = tw + 20; canvas.height = th + 20;
    ctx.font = font; ctx.fillStyle = textColor; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new Texture(gl, { generateMipmaps: false });
    texture.image = canvas;
    const geometry = new Plane(gl);
    const program = new Program(gl, {
      vertex: `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragment: `precision highp float;uniform sampler2D tMap;varying vec2 vUv;void main(){vec4 c=texture2D(tMap,vUv);if(c.a<0.1)discard;gl_FragColor=c;}`,
      uniforms: { tMap: { value: texture } }, transparent: true
    });
    this.mesh = new Mesh(gl, { geometry, program });
    const aspect = canvas.width / canvas.height;
    const textHeight = plane.scale.y * 0.15;
    this.mesh.scale.set(textHeight * aspect, textHeight, 1);
    this.mesh.position.y = -plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(plane);
  }
}

class Media {
  extra = 0; geometry: any; gl: any; image!: string; index!: number; length!: number;
  renderer: any; scene: any; screen: any; text!: string; viewport: any; bend!: number;
  textColor!: string; borderRadius!: number; font!: string; program: any; plane: any;
  title: any; scale: any; padding: any; width: any; widthTotal: any; x: any;
  speed = 0; isBefore = false; isAfter = false;

  constructor({ geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius = 0, font }: any) {
    Object.assign(this, { geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius, font });
    this.createShader(); this.createMesh(); this.createTitle(); this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false, depthWrite: false,
      vertex: `precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform float uTime;uniform float uSpeed;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z=(sin(p.x*4.0+uTime)*1.5+cos(p.y*2.0+uTime)*1.5)*(0.1+uSpeed*0.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
      fragment: `precision highp float;uniform vec2 uImageSizes;uniform vec2 uPlaneSizes;uniform sampler2D tMap;uniform float uBorderRadius;varying vec2 vUv;float roundedBoxSDF(vec2 p,vec2 b,float r){vec2 d=abs(p)-b;return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;}void main(){vec2 ratio=vec2(min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0));vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);vec4 color=texture2D(tMap,uv);float d=roundedBoxSDF(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);float edgeSmooth=0.002;float alpha=1.0-smoothstep(-edgeSmooth,edgeSmooth,d);gl_FragColor=vec4(color.rgb,alpha);}`,
      uniforms: { tMap: { value: texture }, uPlaneSizes: { value: [0,0] }, uImageSizes: { value: [0,0] }, uSpeed: { value: 0 }, uTime: { value: 100*Math.random() }, uBorderRadius: { value: this.borderRadius } },
      transparent: true
    });
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = this.image;
    img.onload = () => { texture.image = img; this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight]; };
  }
  createMesh() { this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program }); this.plane.setParent(this.scene); }
  createTitle() { this.title = new Title({ gl: this.gl, plane: this.plane, renderer: this.renderer, text: this.text, textColor: this.textColor, font: this.font }); }
  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x; const H = this.viewport.width / 2;
    if (this.bend === 0) { this.plane.position.y = 0; this.plane.rotation.z = 0; }
    else { const B = Math.abs(this.bend); const R = (H*H+B*B)/(2*B); const eX = Math.min(Math.abs(x),H); const arc = R-Math.sqrt(R*R-eX*eX); if(this.bend>0){this.plane.position.y=-arc;this.plane.rotation.z=-Math.sign(x)*Math.asin(eX/R);}else{this.plane.position.y=arc;this.plane.rotation.z=Math.sign(x)*Math.asin(eX/R);} }
    this.speed = scroll.current - scroll.last; this.program.uniforms.uTime.value += 0.04; this.program.uniforms.uSpeed.value = this.speed;
    const po = this.plane.scale.x/2; const vo = this.viewport.width/2;
    this.isBefore = this.plane.position.x + po < -vo; this.isAfter = this.plane.position.x - po > vo;
    if (direction === 'right' && this.isBefore) { this.extra -= this.widthTotal; this.isBefore = this.isAfter = false; }
    if (direction === 'left' && this.isAfter) { this.extra += this.widthTotal; this.isBefore = this.isAfter = false; }
  }
  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen; if (viewport) this.viewport = viewport;
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2; this.width = this.plane.scale.x + this.padding; this.widthTotal = this.width * this.length; this.x = this.width * this.index;
  }
}

class GalleryApp {
  container: HTMLElement; scrollSpeed: number; scroll: any; renderer: any; gl: any; camera: any; scene: any; screen: any; viewport: any; planeGeometry: any; medias: any; mediasImages: any; isDown = false; start = 0; raf = 0;
  onCheckDebounce: any;
  boundOnResize: any; boundOnWheel: any; boundOnTouchDown: any; boundOnTouchMove: any; boundOnTouchUp: any;

  constructor(container: HTMLElement, { items, bend, textColor = '#ffffff', borderRadius = 0, font = 'bold 24px Inter', scrollSpeed = 2, scrollEase = 0.05 }: any = {}) {
    this.container = container; this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer(); this.createCamera(); this.createScene(); this.onResize();
    this.createGeometry(); this.createMedias(items, bend, textColor, borderRadius, font);
    this.update(); this.addEventListeners();
  }
  createRenderer() { this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio||1, 2) }); this.gl = this.renderer.gl; this.gl.clearColor(0,0,0,0); this.container.appendChild(this.gl.canvas); }
  createCamera() { this.camera = new Camera(this.gl); this.camera.fov = 45; this.camera.position.z = 20; }
  createScene() { this.scene = new Transform(); }
  createGeometry() { this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 }); }
  createMedias(items: any[], bend = 1, textColor: string, borderRadius: number, font: string) {
    const galleryItems = items?.length ? items : [];
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data: any, index: number) => new Media({
      geometry: this.planeGeometry, gl: this.gl, image: data.image, index, length: this.mediasImages.length,
      renderer: this.renderer, scene: this.scene, screen: this.screen, text: data.text, viewport: this.viewport,
      bend, textColor, borderRadius, font
    }));
  }
  onTouchDown(e: any) { this.isDown = true; this.scroll.position = this.scroll.current; this.start = e.touches ? e.touches[0].clientX : e.clientX; }
  onTouchMove(e: any) { if (!this.isDown) return; const x = e.touches ? e.touches[0].clientX : e.clientX; this.scroll.target = this.scroll.position + (this.start - x) * (this.scrollSpeed * 0.025); }
  onTouchUp() { this.isDown = false; this.onCheck(); }
  onWheel(e: any) { const d = e.deltaY || e.wheelDelta || e.detail; this.scroll.target += (d > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2; this.onCheckDebounce(); }
  onCheck() { if (!this.medias?.[0]) return; const w = this.medias[0].width; const i = Math.round(Math.abs(this.scroll.target)/w); const item = w*i; this.scroll.target = this.scroll.target < 0 ? -item : item; }
  onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };
    this.medias?.forEach((m: any) => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const dir = this.scroll.current > this.scroll.last ? 'right' : 'left';
    this.medias?.forEach((m: any) => m.update(this.scroll, dir));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this); this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this); this.boundOnTouchMove = this.onTouchMove.bind(this); this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    this.container.addEventListener('wheel', this.boundOnWheel);
    this.container.addEventListener('mousedown', this.boundOnTouchDown); this.container.addEventListener('mousemove', this.boundOnTouchMove); this.container.addEventListener('mouseup', this.boundOnTouchUp);
    this.container.addEventListener('touchstart', this.boundOnTouchDown); this.container.addEventListener('touchmove', this.boundOnTouchMove); this.container.addEventListener('touchend', this.boundOnTouchUp);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    this.container.removeEventListener('wheel', this.boundOnWheel);
    this.container.removeEventListener('mousedown', this.boundOnTouchDown); this.container.removeEventListener('mousemove', this.boundOnTouchMove); this.container.removeEventListener('mouseup', this.boundOnTouchUp);
    this.container.removeEventListener('touchstart', this.boundOnTouchDown); this.container.removeEventListener('touchmove', this.boundOnTouchMove); this.container.removeEventListener('touchend', this.boundOnTouchUp);
    if (this.renderer?.gl?.canvas?.parentNode) this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
  }
}

export default function CircularGallery({ items, bend = 3, textColor = '#ffffff', borderRadius = 0.05, font = 'bold 24px Inter', scrollSpeed = 2, scrollEase = 0.05 }: {
  items?: { image: string; text: string }[];
  bend?: number; textColor?: string; borderRadius?: number; font?: string; scrollSpeed?: number; scrollEase?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const app = new GalleryApp(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    return () => app.destroy();
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);
  return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', cursor: 'grab' }} />;
}
