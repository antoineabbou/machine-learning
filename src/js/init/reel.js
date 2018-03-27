const THREE = require('three/build/three.js');
const debounce = require('js-util/debounce');

import normalizeVector2 from '../modules/common/normalizeVector2';
import Boxes from '../modules/sketch/reel/Boxes.js';
import Floor from '../modules/sketch/reel/Floor.js';
import Hill from '../modules/sketch/reel/Hill.js';
import Head from '../modules/sketch/reel/Head.js';

// var sound = require('../../sounds/audio.mp3')

export default function() {
  const canvas = document.getElementById('canvas-webgl');
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas,
  });
  const renderPicked = new THREE.WebGLRenderTarget(document.body.clientWidth, window.innerHeight);
  const scene = new THREE.Scene();
  const scenePicked = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, document.body.clientWidth / window.innerHeight, 1, 15000);
  const clock = new THREE.Clock();

  const vectorTouchStart = new THREE.Vector2();
  const vectorTouchMove = new THREE.Vector2();
  const vectorTouchMovePrev = new THREE.Vector2();
  const vectorTouchEnd = new THREE.Vector2();
  const pixelBuffer = new Uint8Array(4);

  let isDrag = false;

  //
  // process for this sketch.
  //

  const boxes = new Boxes();
  const floor = new Floor();
  const hill = new Hill();
  const head = new Head();

  //
  // common process
  //
  const resizeWindow = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = window.innerHeight;
    camera.aspect = document.body.clientWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(document.body.clientWidth, window.innerHeight);
    renderPicked.setSize(document.body.clientWidth, window.innerHeight);
    floor.resize();
  }
  const render = () => {
    const time = clock.getDelta();
    renderer.setClearColor(0xf1f1f1, 1.0);
    boxes.render(time);
    // floor.render(renderer, scene, time);
    hill.render(renderer, scene, time);
    head.render(renderer, scene, time);
    renderer.render(scene, camera);
  }
  const renderLoop = () => {
    render();
    requestAnimationFrame(renderLoop);
  }
  const touchStart = (isTouched) => {
    isDrag = true;
  };
  const touchMove = (isTouched) => {
    if (isDrag) {
      if (isTouched) {
        boxes.rotate((vectorTouchMove.x - vectorTouchMovePrev.x) * 2);
      }
    } else {
      renderer.setClearColor(0xffffff, 1.0);
      renderer.render(scenePicked, camera, renderPicked);
      renderer.readRenderTargetPixels(renderPicked, vectorTouchMove.x, renderPicked.height - vectorTouchMove.y, 1, 1, pixelBuffer);
      boxes.picked((pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]));
    }
  };
  const touchEnd = (isTouched) => {
    isDrag = false;
  };
  const wheel = (event) => {
    boxes.rotate(event.deltaY);
  }
  const on = () => {
    window.addEventListener('resize', debounce(() => {
      resizeWindow();
    }), 1000);
    canvas.addEventListener('mousedown', function (event) {
      event.preventDefault();
      vectorTouchStart.set(event.clientX, event.clientY);
      touchStart(false);
    });
    document.addEventListener('mousemove', function (event) {
      event.preventDefault();
      vectorTouchMove.set(event.clientX, event.clientY);
      touchMove(false);
    });
    document.addEventListener('mouseup', function (event) {
      event.preventDefault();
      vectorTouchEnd.set(event.clientX, event.clientY);
      touchEnd(false);
    });
    canvas.addEventListener('wheel', function(event) {
      event.preventDefault();
      wheel(event);
    });
    canvas.addEventListener('touchstart', function (event) {
      event.preventDefault();
      vectorTouchStart.set(event.touches[0].clientX, event.touches[0].clientY);
      vectorTouchMove.set(event.touches[0].clientX, event.touches[0].clientY);
      vectorTouchMovePrev.set(event.touches[0].clientX, event.touches[0].clientY);
      touchStart(event.touches[0].clientX, event.touches[0].clientY, true);
    });
    canvas.addEventListener('touchmove', function (event) {
      event.preventDefault();
      vectorTouchMove.set(event.touches[0].clientX, event.touches[0].clientY);
      touchMove(true);
      vectorTouchMovePrev.set(event.touches[0].clientX, event.touches[0].clientY);
    });
    canvas.addEventListener('touchend', function (event) {
      event.preventDefault();
      vectorTouchEnd.set(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
      touchEnd(true);
    });
  }

  const init = () => {
    let audio = new Audio('../../sounds/audio.mp3');
    audio.volume = 0.4
    audio.play()
    renderer.setSize(document.body.clientWidth, window.innerHeight);
    camera.position.set(0, 400, -3000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    floor.mirrorCamera.position.set(0, -400, -3000);
    floor.mirrorCamera.lookAt(new THREE.Vector3(0, 0, 0));

    boxes.core.obj.position.set(0, 80, 0);
    boxes.wire.obj.position.set(0, 80, 0);
    boxes.wire.objPicked.position.set(0, 80, 0);
    floor.obj.rotation.set(-0.5 * Math.PI, 0, 0)

    scene.add(boxes.core.obj);
    scene.add(boxes.wire.obj);
    scene.add(floor.obj);
    scene.add(hill.obj);
    scene.add(head.obj);
    console.log('hill object is : ', hill.obj)
    console.log('head object is : ', head.obj)
    scene.add(hill.cubeCamera);
    scene.add(head.cubeCamera);
    scenePicked.add(boxes.wire.objPicked);

    on();
    resizeWindow();
    renderLoop();
  }
  init();
}
