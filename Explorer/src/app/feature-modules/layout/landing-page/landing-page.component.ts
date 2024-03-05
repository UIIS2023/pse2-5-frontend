import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'xp-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  private van: THREE.Object3D;
  buttonClicked: boolean = false;

  constructor(private router: Router,
    private assetPreloadingService: LayoutService) { }

  async ngOnInit(): Promise<void> {

    await this.assetPreloadingService.preloadAssets();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('#bg') as HTMLCanvasElement,
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(42);
    camera.position.setX(32);
    camera.position.setY(-12);

    const loader = new GLTFLoader();

    await Promise.all([
      new Promise<void>((resolve) => {
        loader.load('./assets/map/scene.gltf', (gltfScene) => {
          const map = gltfScene.scene;

          map.position.set(0, -24, 0);
          map.scale.set(0.05, 0.05, 0.05);

          scene.add(map);
          resolve();
        });
      }),

      new Promise<void>((resolve) => {
        loader.load('./assets/van/scene.gltf', (gltfScene) => {
          this.van = gltfScene.scene;

          this.van.position.set(8, -10, 0);
          this.van.scale.set(0.05, 0.05, 0.05);

          scene.add(this.van);
          resolve();
        });
      }),

      new Promise<void>((resolve) => {
        const spaceTexture = new THREE.TextureLoader().load('../../../../assets/images/background_landing_page.jpg', () => {
          scene.background = spaceTexture;
          resolve();
        });
      }),
    ]);

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(0, 10, 15);
    pointLight.intensity = 2;

    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = 5;

    scene.add(pointLight, ambientLight);

    const lightHelper = new THREE.PointLightHelper(pointLight);
    const gridHelper = new THREE.GridHelper(200, 50);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    function animate(this: LandingPageComponent) {
      requestAnimationFrame(animate.bind(this));

      controls.update();

      if (this.buttonClicked) {
        if (this.van) {
          this.van.position.z += 1;
          this.van.position.y += 0.02;
        }
      }

      renderer.render(scene, camera);
    }

    animate.call(this);
  }

  moveVan(): void {
    this.buttonClicked = true;

    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 1500);
  }
}
