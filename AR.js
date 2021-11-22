



var arToolkitSource, arToolkitContext;

var markerRoot1;

var mesh1;




export function initAR() {

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
		
}


			

export function loadGLTF_AR( pfad ) {
		
	markerRoot1.add(model);

}


export function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );	
}


