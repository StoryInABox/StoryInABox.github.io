import * as THREE from './build/three.module.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import { DRACOLoader } from './js/DRACOLoader.js';
import { RGBELoader } from './js/RGBELoader.js';
import { OrbitControls } from './controls/OrbitControls.js';
//import { CSS2DRenderer, CSS2DObject } from './js/CSS2DRenderer.js';

let clock, renderer,scene, camera, controls, pmremGenerator, RGBE, dracoLoader, loader, model, mixer;

let AnimationCount, ClipDuration;

let Dateipfad = "./models/"+document.getElementById("title").innerHTML+".gltf"
let Framerate = 24;



let sliderpos = document.querySelector("input[type='range']");
let PlayButton = document.getElementsByClassName("playpause");

let Playstate = false;

let loadingStautus =  new THREE.LoadingManager();

export function init(){

    clock = new THREE.Clock();
    sliderpos.value = 0;
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

                timestamps();

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
            

let timeCapture=0;

function animate(){

    requestAnimationFrame( animate );
    sliderObserver();
    playerObserver();
    
    


    renderer.render( scene, camera );
}



function playerObserver(){
    //timeCapture = mixer.time;
    const delta = clock.getDelta();

    if (typeof mixer !== 'undefined'){

        if (Playstate == true) {

            mixer.update( delta );
            sliderpos.value = mixer.time/Object.values(ClipDuration)[2]*100;  
            //console.log( sliderpos.value)

            if (mixer.time > Object.values(ClipDuration)[2]) {
                mixer.time = 0;
            }    
    
            timeCapture = mixer.time;
        }

        if (Playstate == false) {
            
            mixer.setTime(timeCapture);

        }
    }
    
}

function sliderObserver(){
    let slider = document.getElementById("sliderid");
    slider.oninput = function() {

        if (Playstate==true){
            Playstate=false;
            PlayButton[0].classList.toggle("checked");
        }
        Object.values(ClipDuration)[2]
        let sliderConverted = slider.value*Object.values(ClipDuration)[2]/100;           
        //console.log(sliderConverted);
        timeCapture = sliderConverted;
    }
    
}


export function timestamps() {
    let stampmark = [];
    let stamps = document.getElementById("stamps");
    let stampcount = stamps.children.length;
    let FramesTotal = ClipDuration.duration*Framerate;
    //console.log(ClipDuration.duration*Framerate)
    
        for (let o = 0; o < stampcount; o++){
            let stampcurent = stamps.children[o].id;
            //console.log(stampcurent)
            stamps.children[o].style.left = ""+(stampcurent*100/FramesTotal)+"%"; 
            //console.log(stampcurent/FramesTotal*ClipDuration.duration);
            //stampmark.push(stampcurent/FramesTotal*ClipDuration.duration);
            stampmark.push(Math.round(stampcurent*100/FramesTotal));
            //console.log((slider.value)*Object.values(ClipDuration)[2]/100);
        }
}

export function playpause(){

    
    PlayButton[0].addEventListener('click',function() {
        
        this.classList.toggle("checked");
        Playstate = !Playstate;
        

    });

    
}


function getAnimationInfo() {

    let ChildCount = Object.keys(model.children).length;
    console.log(Object.keys(model.children).length);

}
