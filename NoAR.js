
export function initNoAR() {

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.set( 5, 2, 8 );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.update();
	controls.enablePan = false;
	controls.enableDamping = true;
    scene.add(camera);

	scene.background = envMap;
	scene.environment = envMap;
}

export function loadGLTF_NoAR( pfad ) {	
    scene.add( model );
}


export function animateNoAR() {
	controls.update();
}