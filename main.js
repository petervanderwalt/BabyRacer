import * as THREE from 'three';

import Stats from '/stats.module.js';

import {
  OrbitControls
} from '/OrbitControls.js';

import {
  GLTFLoader
} from '/GLTFLoader.js';
import {
  DRACOLoader
} from '/DRACOLoader.js';
import {
  RGBELoader
} from '/RGBELoader.js';

let camera, scene, renderer;
let stats;

let grid;
let controls;

//let window.carModel;

const wheels = [];
var wheel_fl = new THREE.Group(),
  wheel_fr = new THREE.Group()

function init() {

  const container = document.getElementById('container');

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);

  stats = new Stats();
  container.appendChild(stats.dom);

  //

  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 6, 10);
  //camera.lookAt(-30, 3, -30);

  controls = new OrbitControls(camera, container);
  controls.enableDamping = true;
  controls.maxDistance = 900;
  controls.target.set(0, 3, 3);
  controls.update();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);
  scene.environment = new RGBELoader().load('/venice_sunset_1k.hdr');
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;
  scene.fog = new THREE.Fog(0x333333, 100, 150);



  grid = new THREE.GridHelper(400, 400, 0x00ff00, 0xffffff);
  grid.material.opacity = 0.2;
  grid.material.depthWrite = false;
  grid.material.transparent = true;
  scene.add(grid);

  // materials

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 1.0,
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    sheen: 0.5
  });

  const detailsMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.5
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.25,
    roughness: 0,
    transmission: 1.0
  });

  const bodyColorInput = document.getElementById('body-color');
  bodyColorInput.addEventListener('input', function() {

    bodyMaterial.color.set(this.value);

  });

  const detailsColorInput = document.getElementById('details-color');
  detailsColorInput.addEventListener('input', function() {

    detailsMaterial.color.set(this.value);

  });

  const glassColorInput = document.getElementById('glass-color');
  glassColorInput.addEventListener('input', function() {

    glassMaterial.color.set(this.value);

  });

  // Car

  const shadow = new THREE.TextureLoader().load('/ferrari_ao.png');

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('js/libs/draco/gltf/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  loader.load('/ferrari.glb', function(gltf) {

    window.carModel = gltf.scene.children[0];

    window.carModel.getObjectByName('body').material = bodyMaterial;

    window.carModel.getObjectByName('rim_fl').material = detailsMaterial;
    window.carModel.getObjectByName('rim_fr').material = detailsMaterial;
    window.carModel.getObjectByName('rim_rr').material = detailsMaterial;
    window.carModel.getObjectByName('rim_rl').material = detailsMaterial;
    window.carModel.getObjectByName('trim').material = detailsMaterial;

    window.carModel.getObjectByName('glass').material = glassMaterial;


    // wheel_fl = new THREE.Group();
    wheel_fl.position.x = window.carModel.getObjectByName('wheel_fl').position.x
    wheel_fl.position.y = window.carModel.getObjectByName('wheel_fl').position.y
    wheel_fl.position.z = window.carModel.getObjectByName('wheel_fl').position.z
    wheel_fl.add(window.carModel.getObjectByName('wheel_fl'));
    wheel_fl.children[0].position.x = 0;
    wheel_fl.children[0].position.y = 0;
    wheel_fl.children[0].position.z = 0;

    wheel_fr.position.x = window.carModel.getObjectByName('wheel_fr').position.x
    wheel_fr.position.y = window.carModel.getObjectByName('wheel_fr').position.y
    wheel_fr.position.z = window.carModel.getObjectByName('wheel_fr').position.z
    wheel_fr.add(window.carModel.getObjectByName('wheel_fr'));
    wheel_fr.children[0].position.x = 0;
    wheel_fr.children[0].position.y = 0;
    wheel_fr.children[0].position.z = 0;

    window.carModel.add(wheel_fl);
    window.carModel.add(wheel_fr);


    wheels.push(
      window.carModel.getObjectByName('wheel_fl'),
      window.carModel.getObjectByName('wheel_fr'),
      window.carModel.getObjectByName('wheel_rl'),
      window.carModel.getObjectByName('wheel_rr')
    );

    // shadow
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
      new THREE.MeshBasicMaterial({
        map: shadow,
        blending: THREE.MultiplyBlending,
        toneMapped: false,
        transparent: true
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = 2;
    window.carModel.add(mesh);

    scene.add(window.carModel);
  });

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function render() {

  update();

  controls.update();

  const time = -performance.now() / 1000;

  for (let i = 0; i < wheels.length; i++) {

    wheels[i].rotation.x = (time * Math.PI * 2) * 4;

  }

  grid.position.z = (-(time) % 0.5) * 20;

  if (grid.rotation.y > 0) {
    grid.rotation.y = grid.rotation.y - 0.005
  }

  if (grid.rotation.y < 0) {
    grid.rotation.y = grid.rotation.y + 0.005
  }


  //grid.rotation.y = -(time) % 1;

  renderer.render(scene, camera);

  stats.update();

}

init();

// Modified from: https://gist.github.com/videlais/8110000
// Modified by Xander Luciano
class GamePad {
  constructor() {
    this.supported = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
      !!navigator.webkitGamepads || !!navigator.mozGamepads ||
      !!navigator.msGamepads || !!navigator.gamepads ||
      (navigator.getGamepads && navigator.getGamepads());

    this.ticking = false;

    this.pan = new THREE.Vector3(0, 0, 0);
    this.roll = new THREE.Vector3(0, 0, 0);

    // Recommended deadzones for Xbox One controller
    this.RIGHT_AXIS_THRESHOLD = 7849 / 32767.0;
    this.LEFT_AXIS_THRESHOLD = 8689 / 32767.0;
    this.TRIGGER_AXIS_THRESHOLD = 30 / 32767.0;

    this.SPACEMOUSE_THRESHOLD = 5 / 32767.0;

    this.gamepads = [];
    this.prevRawGamepadTypes = [];
    this.prevTimestamps = [];

    this.init();
  }

  init() {
    if (this.supported) {
      // Older Firefox
      window.addEventListener('MozGamepadConnected', (e) => this.onGamepadConnect(e), false);
      window.addEventListener('MozGamepadDisconnected', (e) => this.onGamepadDisconnect(e), false);

      //W3C Specification
      window.addEventListener('gamepadconnected', (e) => this.onGamepadConnect(e), false);
      window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnect(e), false);

      // Chrome
      if (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) {
        this.startPolling();
      }

      //CocoonJS
      if (navigator.getGamepads && navigator.getGamepads()) {
        this.startPolling();
      }
    } else {
      console.log('Gamepad API not supported or not detected!');
    }
  }

  startPolling() {
    console.log('Controller Connected!');
    if (!this.ticking) {
      this.ticking = true;
      this.update();
    }
  }

  stopPolling() {
    console.log('Controller Disconnected!');
    this.ticking = false;
  }

  // Called externally
  update() {
    this.pollStatus();
    if (this.ticking) {
      this.pollJoysticks();
      //requestAnimationFrame(() => this.tick());
    }
  }

  pollStatus() {
    this.pollGamepads();
    for (let i in this.gamepads) {
      let gamepad = this.gamepads[i];
      if (gamepad.timestamp && (gamepad.timestamp === this.prevTimestamps[i])) {
        continue;
      }
      this.prevTimestamps[i] = gamepad.timestamp;
    }
  }

  pollGamepads() {
    let rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) ||
      navigator.webkitGamepads || navigator.mozGamepads ||
      navigator.msGamepads || navigator.gamepads ||
      (navigator.getGamepads && navigator.getGamepads());
    if (rawGamepads) {
      this.gamepads = [];
      for (let i = 0, max = rawGamepads.length; i < max; i++) {
        if (typeof rawGamepads[i] !== this.prevRawGamepadTypes[i]) {
          this.prevRawGamepadTypes[i] = typeof rawGamepads[i];
        }
        if (rawGamepads[i]) {
          this.gamepads.push(rawGamepads[i]);
        }
      }
    }
  }

  pollJoysticks() {
    let pad = 0;

    // Reset all input to 0
    this.pan = new THREE.Vector3(0, 0, 0);
    this.roll = new THREE.Vector3(0, 0, 0);

    if (this.gamepads[pad]) {

      let panX = this.gamepads[pad].axes[0]; // Pan  X || Left X
      let panY = this.gamepads[pad].axes[1]; // Pan  Y || Left Y
      let panZ = this.gamepads[pad].axes[2]; // Pan  Z || Right X

      let rollX = this.gamepads[pad].axes[3]; // Roll X || Right Y
      let rollY = this.gamepads[pad].axes[4]; // Roll Y || Trigger Left
      let rollZ = this.gamepads[pad].axes[5]; // Roll Z || Trigger Right

      if (panX < -this.SPACEMOUSE_THRESHOLD ||
        panX > this.SPACEMOUSE_THRESHOLD) {
        this.pan.x = panX;
      }

      if (panY < -this.SPACEMOUSE_THRESHOLD ||
        panY > this.SPACEMOUSE_THRESHOLD) {
        this.pan.y = panY;
      }

      if (panZ < -this.SPACEMOUSE_THRESHOLD ||
        panZ > this.SPACEMOUSE_THRESHOLD) {
        this.pan.z = panZ;
      }

      if (rollX < -this.SPACEMOUSE_THRESHOLD ||
        rollX > this.SPACEMOUSE_THRESHOLD) {
        this.roll.x = rollX;
      }

      if (rollY < -this.SPACEMOUSE_THRESHOLD ||
        rollY > this.SPACEMOUSE_THRESHOLD) {
        this.roll.y = rollY;
      }

      if (rollZ < -this.SPACEMOUSE_THRESHOLD ||
        rollZ > this.SPACEMOUSE_THRESHOLD) {
        this.roll.z = rollZ;
      }
    }
  }

  onGamepadConnect(event) {
    console.log(event);
    let gamepad = event.gamepad;
    this.gamepads[event.gamepad.id] = gamepad;
    this.startPolling();
  }

  onGamepadDisconnect(event) {
    this.gamepads[event.gamepad.id] = null;
    if (this.gamepads.length === 0) {
      this.stopPolling();
    }
  }
}

// Create controllr with Gamepad API
let controller = new GamePad();
console.log(controller);

// Called every frame
function update() {
  // Update Joysticks
  controller.update();

  //grid.rotation.x += 10 * Math.PI / 360 * controller.pan.x;
  //grid.rotation.z += 10 * Math.PI / 360 * controller.pan.y;
  //grid.rotation.z -= 10 * Math.PI / 360 * controller.pan.y;

  grid.rotation.y += ((controller.pan.x) * Math.PI / 120);


  //grid.position.x += 0.15 * controller.pan.x;
  grid.position.x - ((controller.pan.x) * Math.PI / 6);
  grid.position.z += 0.15 * controller.pan.y;
  grid.position.y -= 0.15 * controller.pan.z;

  if (window.carModel) {
    carModel.rotation.y = -((controller.pan.x) * Math.PI / 3);
    carModel.getObjectByName('steering_wheel').rotation.y = ((controller.pan.x) * Math.PI / 2);
    wheel_fl.rotation.y = -((controller.pan.x) * Math.PI / 4);
    wheel_fr.rotation.y = -((controller.pan.x) * Math.PI / 4);
  }


  //window.carModel.rotation.y = window.carModel.rotation.y - ((controller.pan.x) * Math.PI / 360);

  //console.log(JSON.stringify(controls))
}