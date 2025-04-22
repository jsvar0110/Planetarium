import "./style.css";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import gsap from "gsap";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const loader = new RGBELoader();
loader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

camera.position.z = 9;

const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/jupiter.jpg",
  "./volcanic/mars.jpg",
];
const spheres = new THREE.Group();

const starsTexture = new THREE.TextureLoader().load("/stars.jpg");
starsTexture.colorSpace = THREE.SRGBColorSpace;

const starsGeometry = new THREE.SphereGeometry(50, 64, 64);
const starsMaterial = new THREE.MeshStandardMaterial({
  map: starsTexture,
  opacity: 0.1,
  side: THREE.BackSide,
});
const starSphere = new THREE.Mesh(starsGeometry, starsMaterial);
scene.add(starSphere);

const spheresMesh = [];

for (let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);

  spheresMesh.push(sphere);

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);
  spheres.add(sphere);
}

spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

function handleScroll(event) {
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;
    scrollCount = (scrollCount + 1) % 4;

    const heading = document.querySelectorAll(".heading");
    gsap.to(heading, {
      duration: 1,
      y: `-=${100}%`,
      ease: "power2.inOut",
    });

    gsap.to(spheres.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}`,
      ease: "power2.inOut",
    });

    if (scrollCount === 0) {
      gsap.to(heading, {
        duration: 1,
        y: `0`,
        ease: "power2.inOut",
      });
    }
  }
}

window.addEventListener("wheel", handleScroll);
window.addEventListener("touchmove", (event) => {
  event.preventDefault();
  handleScroll(event);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  spheresMesh.forEach((sphere) => {
    sphere.rotation.y = clock.getElapsedTime() * 0.04;
  });
  renderer.render(scene, camera);
}
animate();
