import "/src/style.css";
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from 'gsap';

// Setup scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25, 
  window.innerWidth / window.innerHeight,
   0.1,
  100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
});


// // Add lights
// const pointLight = new THREE.PointLight("white");
// pointLight.position.set(5, 5, 5);
// const ambientLight = new THREE.AmbientLight("white");
// scene.add(pointLight, ambientLight);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const loader = new RGBELoader();
loader.load("https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",function(texture){
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

camera.position.z=9;

const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",];
const spheres = new THREE.Group();

// Load HDRI texture


const starsTexture = new THREE.TextureLoader().load('/stars.jpg');
starsTexture.colorSpace = THREE.SRGBColorSpace;

const starsGeometry = new THREE.SphereGeometry(50, 64, 64);
const starsMaterial = new THREE.MeshStandardMaterial({
  map: starsTexture,
  opacity: 0.1,
  side: THREE.BackSide
});
const starSphere = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(starSphere);

const spheresMesh = [];

for (let i = 0; i < 4; i++) {
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textures[i]);
texture.colorSpace = THREE.SRGBColorSpace;

const geometry = new THREE.SphereGeometry(radius, segments, segments);
const material = new THREE.MeshStandardMaterial({map:texture});
const sphere = new THREE.Mesh(geometry, material);


spheresMesh.push(sphere);


const angle = (i/4) * (Math.PI * 2);
sphere.position.x = orbitRadius * Math.cos(angle);
sphere.position.z = orbitRadius * Math.sin(angle);
spheres.add(sphere);
}
spheres.rotation.x =0.1
spheres.position.y =-0.8
scene.add(spheres);



// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

function throttleWheelHandler(event) {
  
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;
   const direction = event.deltaY > 0 ? "down" : "up";
  
   scrollCount=(scrollCount+1)%4;
   console.log(scrollCount);

   const heading = document.querySelectorAll(".heading");
   gsap.to(heading,{
     duration: 1,
    y:`-=${100}%`,
    ease: "power2.inOut",
   });

   gsap.to(spheres.rotation,{
    duration: 1,
    y:`-=${Math.PI/2}%`,
    ease: "power2.inOut",
   });

   if(scrollCount===0){
    gsap.to(heading,{
      duration: 1,
      y:`0`,
      ease: "power2.inOut",
     });
   }
  }
}
window.addEventListener('wheel', throttleWheelHandler);

const clock = new THREE.Clock();
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  for(let i=0;i<spheresMesh.length;i++){
  const sphere = spheresMesh[i];
  sphere.rotation.y = clock.getElapsedTime()*0.04;
}
renderer.render(scene, camera);
}
animate();
