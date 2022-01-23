import * as THREE from './build/three.module.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import { DRACOLoader } from './js/DRACOLoader.js';
import { RGBELoader } from './js/RGBELoader.js';
import { OrbitControls } from './controls/OrbitControls.js';
//import { CSS2DRenderer, CSS2DObject } from './js/CSS2DRenderer.js';

let clock, renderer,scene, camera, controls, pmremGenerator, RGBE, dracoLoader, loader, model, mixer;

let AnimationCount, ClipDuration;

let Dateipfad = "./models/"+document.getElementById("title").innerHTML+".gltf"


let loadingStautus =  new THREE.LoadingManager();

export function init(){

    

    clock = new THREE.Clock();

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( 5, 2, 8 );
    
		
	RGBE = new RGBELoader(loadingStautus)
	RGBE.setDataType( THREE.UnsignedByteType )
	RGBE.setPath( './textures/equirectangular/' )
	RGBE.load( 'studio_small_08_1k.hdr', function ( texture ) {

		const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
        
        scene.environment = envMap;
        //scene.background = envMap;
       

		texture.dispose();
		pmremGenerator.dispose();

	});


    loadingStautus.onStart = function ( url, itemsLoaded, itemsTotal ) {

		console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

	};

    loadingStautus.onLoad = function ( ) {

        console.log( 'Loading complete!');
        //console.log(loadingCanvas[0].classList.toggle("checked"))
        setTimeout(function() {
            let loadingCanvas = document.getElementsByClassName("loading");
            loadingCanvas[0].classList.toggle("checked");
        }, 50);
        
    };


    dracoLoader = new DRACOLoader(loadingStautus);
	dracoLoader.setDecoderPath( 'js/draco/gltf/' );

    loader = new GLTFLoader(loadingStautus)
        
    loader.setDRACOLoader( dracoLoader );
    loader.load(

        
        Dateipfad,
        function (gltf) {
                            
            model = gltf.scene;
            model.position.set( 0, 0, 0 );
            model.scale.set( 1, 1, 1 );

            //getAnimationInfo(model);	
            scene.add( model );


            AnimationCount = Object.keys(gltf.animations).length;

            mixer = new THREE.AnimationMixer( scene );
            
            ClipDuration = mixer.clipAction( gltf.animations[ 0 ] ).getClip();
            
            
            for ( let y = 0; y < AnimationCount; y++) {
            
                
                mixer.clipAction( gltf.animations[y] ).play();

            }
            
    });

    renderer = new THREE.WebGLRenderer({
        antialias : true,
        alpha: true
    });
        
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    //renderer.setSize( 640, 480 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.zIndex = '-1';
    renderer.domElement.style.top = '0px';
    //renderer.domElement.style.left = '0px'
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .5;
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    document.body.appendChild( renderer.domElement );   

    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    
    controls.enablePan = false;
    controls.enableDamping = true;

    pmremGenerator = new THREE.PMREMGenerator( renderer );
    pmremGenerator.compileEquirectangularShader();
        
            
     
            
    window.addEventListener('resize', onWindowResize, false)
    
    animate();

}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
            
    renderer.setSize(window.innerWidth, window.innerHeight);
    
                
 
                
                
}
            



function animate(){
    requestAnimationFrame( animate );
    const delta = clock.getDelta();
    
    if (typeof mixer !== 'undefined'){
        mixer.update( delta );
    }

    renderer.render( scene, camera );
}





function getAnimationInfo() {

    let ChildCount = Object.keys(model.children).length;
    console.log(Object.keys(model.children).length);

}
