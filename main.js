import * as THREE from './build/three.module.js';
import Stats from './jsm/stats.module.js';
			
//import {dat.GUI} from './build/dat.gui.min.js';

import { OrbitControls } from './controls/OrbitControls.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';
import { DRACOLoader } from './loaders/DRACOLoader.js';
import { RGBELoader } from './loaders/RGBELoader.js';
import { AnaglyphEffect } from './effects/AnaglyphEffect.js';
			
/*
import { RoughnessMipmapper } from './effects/RoughnessMipmapper.js';
import { EffectComposer } from './postprocessing/EffectComposer.js';
import { RenderPass } from './postprocessing/RenderPass.js';
*/
			
let mixer, clock, renderer, scene, camera, controls, pmremGenerator, RGBE, envMap, dracoLoader, loader, model, effect;
let dreiD = false;
			
export function init() {
			
	clock = new THREE.Clock();
			
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	//colorgrading
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
	renderer.outputEncoding = THREE.sRGBEncoding;
	document.body.appendChild( renderer.domElement );
			
	scene = new THREE.Scene();
	//monitor XYZ-Axis
	scene.add(new THREE.AxesHelper(5))
	scene.background = new THREE.Color( 0xbfe3dd );
					
	
			
	pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();
			
	RGBE = new RGBELoader()
	RGBE.setDataType( THREE.UnsignedByteType )
	RGBE.setPath( './textures/equirectangular/' )
	RGBE.load( 'spruit_sunrise_4k.hdr', function ( texture ) {

		envMap = pmremGenerator.fromEquirectangular( texture ).texture;

		//scene.background = envMap;
		scene.environment = envMap;

		texture.dispose();
		pmremGenerator.dispose();

	});
					
	dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath( 'js/draco/gltf/' );
	loadGLTF('./models/gltf/Test/1.gltf');

	/*		
	loader = new GLTFLoader()
			
	loader.setDRACOLoader( dracoLoader );
	loader.load(
				
		'./models/gltf/Test/2.gltf',
		function (gltf) {
				
			model = gltf.scene;
			model.position.set( 0, 0, 0 );
			model.scale.set( 1, 1, 1 );
				
			scene.add( model );

			mixer = new THREE.AnimationMixer( model );
			mixer.clipAction( gltf.animations[ 0 ] ).play();

			animate();
		
		},
				
		//check loaded satus		
		(xhr) => {
			console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
		},
		(error) => {
			console.log(error)
		}
	)
	*/
				
	effect = new AnaglyphEffect(renderer);
	effect.setSize( window.innerWidth, window.innerHeight );
							
	window.addEventListener('resize', onWindowResize, false)

}

			
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	effect.setSize( window.innerWidth, window.innerHeight );
				
	renderer.setSize(window.innerWidth, window.innerHeight);
				
	animate();
				
				
}
			
	/*
	//FPS-Monior
	const stats = Stats()
	document.body.appendChild(stats.dom)
	*/
			
//----------------------------------------------------------
			

export function loadGLTF( pfad ) {

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
	camera.position.set( 5, 2, 8 );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.update();
	controls.enablePan = false;
	controls.enableDamping = true;
	

	while(scene.children.length > 0){ 
		scene.remove(scene.children[0]); 
	}

	loader = new GLTFLoader()
			
	loader.setDRACOLoader( dracoLoader );
	loader.load(
				
		pfad,
		function (gltf) {
				
			model = gltf.scene;
			model.position.set( 0, 0, 0 );
			model.scale.set( 1, 1, 1 );
				
			scene.add( model );

			mixer = new THREE.AnimationMixer( model );
			mixer.clipAction( gltf.animations[ 0 ] ).play();

			animate();
		
		},
				
		//check loaded satus		
		(xhr) => {
			console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
		},
		(error) => {
			console.log(error)
		}
	)


}


function animate() {
				
	requestAnimationFrame( animate );

	const delta = clock.getDelta();

	mixer.update( delta );

	controls.update();
				
				
				
	renderer.render( scene, camera );
				
				
	//buttonabfrage
	let btn3D = document.querySelector('#btn3D');

		if (dreiD == false){
			btn3D.addEventListener('click',function() {
				dreiD = true;
			});
		}
		if (dreiD == true){
				btn3D.addEventListener('click',function() {
					dreiD = false;
				});
			}
			
	if (dreiD == true) {
		effect.render( scene, camera );
	}

	//stats.update()			
}
			
