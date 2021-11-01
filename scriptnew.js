import * as THREE from './build/three.module.js';
//import Stats from './jsm/stats.module.js';

import { GLTFLoader } from './js/GLTFLoader.js';
import { DRACOLoader } from './js/DRACOLoader.js';
import { RGBELoader } from './js/RGBELoader.js';
import { OrbitControls } from './controls/OrbitControls.js';

let mixer, clock, renderer, scene, camera, controls, pmremGenerator, RGBE, envMap, dracoLoader, loader, model;

var arToolkitSource, arToolkitContext;

var markerRoot1;

var mesh1;

export function init() {
			
	clock = new THREE.Clock();
	//deltaTime = 0;
	//totalTime = 0;
			
	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	//renderer.setSize( 640, 480 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	//renderer.domElement.style.position = 'absolute'
	//renderer.domElement.style.top = '0px'
	//renderer.domElement.style.left = '0px'
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = .5;
	renderer.outputEncoding = THREE.sRGBEncoding;
	document.body.appendChild( renderer.domElement );
			
	scene = new THREE.Scene();
	//monitor XYZ-Axis
	//scene.add(new THREE.AxesHelper(5))
	//scene.background = new THREE.Color( 0xffffff );
	camera = new THREE.Camera();
	scene.add(camera);
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});

	function onResize()
	{
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot1 = new THREE.Group();
	scene.add(markerRoot1);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type: 'pattern', patternUrl: "data/Testmaker.patt",
	})

	let geometry1 = new THREE.PlaneBufferGeometry(1,1, 4,4);
	let loader = new THREE.TextureLoader();
	// let texture = loader.load( 'images/earth.jpg', render );
	let material1 = new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 0.5 } );
	mesh1 = new THREE.Mesh( geometry1, material1 );
	mesh1.rotation.x = -Math.PI/2;
	//markerRoot1.add( mesh1 );
	
	function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { console.log( 'An error happened' ); }
	




					
	
			
	pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();
			
	RGBE = new RGBELoader()
	RGBE.setDataType( THREE.UnsignedByteType )
	RGBE.setPath( './textures/equirectangular/' )
	RGBE.load( 'studio_small_08_4k.hdr', function ( texture ) {

		envMap = pmremGenerator.fromEquirectangular( texture ).texture;

		//scene.background = envMap;
		scene.environment = envMap;

		texture.dispose();
		pmremGenerator.dispose();

	});
					
	dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath( 'js/draco/gltf/' );
	loadGLTF('./models/1.gltf');
						
	window.addEventListener('resize', onWindowResize, false)
	
}




			
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

				
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

	//camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
	//camera.position.set( 5, 2, 8 );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.update();
	controls.enablePan = false;
	controls.enableDamping = true;
	

	while(markerRoot1.children.length > 0){ 
		markerRoot1.remove(markerRoot1.children[0]); 
	}

	loader = new GLTFLoader()
			
	loader.setDRACOLoader( dracoLoader );
	loader.load(
				
		pfad,
		function (gltf) {
			
			
				
			model = gltf.scene;
			model.position.set( 0, 2, 0 );
			model.scale.set( 2, 2, 2 );
			
			markerRoot1.add(model);
			//scene.add( model );

			mixer = new THREE.AnimationMixer( model );
			mixer.clipAction( gltf.animations[ 0 ] ).play();
			mixer.clipAction( gltf.animations[ 1 ] ).play();
			mixer.clipAction( gltf.animations[ 2 ] ).play();
			mixer.clipAction( gltf.animations[ 3 ] ).play();
			mixer.clipAction( gltf.animations[ 4 ] ).play();

			//animate();
			timer();
		
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




 function render()
{	
	
	var positionMarker = markerRoot1.position;
	var rotationMarker = markerRoot1.rotation;
	var scaleMarker = markerRoot1.scale;
	//console.log(positionMarker);
	renderer.render( scene, camera );
}


 export function animate()
{
	requestAnimationFrame(animate);
	//const delta = clock.getDelta();
	//totalTime += deltaTime;
	
	
	//controls.update();
	timer();
	update();
	render();
}

function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
	
	
}

function timer()
{

const delta = clock.getDelta();
mixer.update( delta );
}