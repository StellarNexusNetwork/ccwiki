<template>
  <div class="main2">
    <div class="body"></div>
  </div>
</template>

<script setup lang="ts">

import {onMounted} from 'vue'
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

onMounted(() => {
  const Dbody = document.querySelector('.body');

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0x999999, 1, 200);
  scene.background = new THREE.Color(0x999999);

  const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
  );


  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  Dbody!.appendChild(renderer.domElement);


  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  const gltfLoader = new GLTFLoader();

  gltfLoader.load('./static/20241108/model/dg-lab-v3.glb', (gltf) => {
    console.log(gltf)
    scene.add(gltf.scene)
  })

  camera.position.z = 5;
  camera.lookAt(0, 0, 0)

  const axisHelper = new THREE.AxesHelper(5);
  scene.add(axisHelper);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.025;

  function animate() {
    controls.update();
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    renderer.render(scene, camera);

  }

  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

  })
})


</script>

<style scoped></style>