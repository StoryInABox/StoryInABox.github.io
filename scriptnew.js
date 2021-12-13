import * as THREE from './build/three.module.js';

import Stats from './js/stats.module.js';

import { GLTFLoader } from './js/GLTFLoader.js';
import { DRACOLoader } from './js/DRACOLoader.js';
import { RGBELoader } from './js/RGBELoader.js';
import { OrbitControls } from './controls/OrbitControls.js';

let mixer, clock, renderer, scene, camera, controls, pmremGenerator, RGBE, envMap, dracoLoader, loader, model, stats, container, aktuelleAnimation;

var arToolkitSource, arToolkitContext;

var markerRoot1;

var mesh1;

container = document.getElementById( 'container' );



export function initAR() {
			
	clock = new THREE.Clock();
	//deltaTime = 0;
	//totalTime = 0;
	
		
	
	
	if (typeof stats !== 'undefined')
	{
		container.removeChild(stats.dom)
	}
	stats = new Stats();
	container.appendChild( stats.dom );

	if (typeof renderer !== 'undefined')
	{
		document.body.removeChild(renderer.domElement)
	}

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	//renderer.setSize( 640, 480 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	//renderer.domElement.style.left = '0px'
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = .5;
	renderer.outputEncoding = THREE.sRGBEncoding;
	
	console.log(document.body.children);
	
	document.body.appendChild( renderer.domElement );
	
	console.log(document.body.children);


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
		arToolkitSource.onResizeElement()	
		arToolkitSource.copyElementSizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)	
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
	loadGLTF_AR('./models/1.gltf');
		
	
}


			

export function loadGLTF_AR( pfad ) {

	console.log("GLTFAR");


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

			requestAnimationFrame(animateAR);

			
		
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



export function loadGLTF_NoAR( pfad ) {

	console.log("GLTFNOAR");

	while(markerRoot1.children.length > 0){ 
		markerRoot1.remove(markerRoot1.children[0]); 
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
			mixer.clipAction( gltf.animations[ 1 ] ).play();
			mixer.clipAction( gltf.animations[ 2 ] ).play();
			mixer.clipAction( gltf.animations[ 3 ] ).play();
			mixer.clipAction( gltf.animations[ 4 ] ).play();

			
			requestAnimationFrame(animateNoAR);

		
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



export function initNoAR() {
	clock = new THREE.Clock();
	//deltaTime = 0;
	//totalTime = 0;


	



	if (typeof stats !== 'undefined')
	{
		container.removeChild(stats.dom)
	}
	
	stats = new Stats();
	container.appendChild( stats.dom );

	if (typeof renderer !== 'undefined')
	{
		document.body.removeChild(renderer.domElement)
	}

	
			
	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	//renderer.setSize( 640, 480 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = '0px';
	//renderer.domElement.style.left = '0px'
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = .5;
	renderer.outputEncoding = THREE.sRGBEncoding;


	


	document.body.appendChild( renderer.domElement );
	
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.set( 5, 2, 8 );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.update();
	controls.enablePan = false;
	controls.enableDamping = true;

	scene = new THREE.Scene();
	//monitor XYZ-Axis
	//scene.add(new THREE.AxesHelper(5))
	//scene.background = new THREE.Color( 0xffffff );
	
	scene.add(camera);

	function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { console.log( 'An error happened' ); }
		
	pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();
			
	RGBE = new RGBELoader()
	RGBE.setDataType( THREE.UnsignedByteType )
	RGBE.setPath( './textures/equirectangular/' )
	RGBE.load( 'studio_small_08_4k.hdr', function ( texture ) {

		envMap = pmremGenerator.fromEquirectangular( texture ).texture;

		scene.background = envMap;
		scene.environment = envMap;

		texture.dispose();
		pmremGenerator.dispose();

	});
					
	dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath( 'js/draco/gltf/' );
	loadGLTF_NoAR('./models/1.gltf');
}





 function render()
{	
	

	//console.log(positionMarker);
	renderer.render( scene, camera );
}


 function animateAR()
{

	if (typeof aktuelleAnimation !== 'undefined')
	{
	  cancelAnimationFrame(aktuelleAnimation)
	}

	aktuelleAnimation = requestAnimationFrame(animateAR);
	//const delta = clock.getDelta();
	//totalTime += deltaTime;
	
	
	//controls.update();
	timer();
	update();
	render();
	stats.update();
	console.log("ar");
}

function animateNoAR()
{
	if (typeof aktuelleAnimation !== 'undefined')
	{
	  cancelAnimationFrame(aktuelleAnimation)
	}


	aktuelleAnimation = requestAnimationFrame(animateNoAR);
	//const delta = clock.getDelta();
	//totalTime += deltaTime;
	
	
	controls.update();
	timer();
	render();
	stats.update();
	console.log("noar");
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
  if (typeof mixer !== 'undefined')
  {
    mixer.update( delta );
  }
}

export function exit (){
	arVideoCapStop();
	arVideoClose();
	argCleanup();

}