import * as THREE from './build/three.module.js';
import Stats from './js/stats.module.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import { DRACOLoader } from './js/DRACOLoader.js';
import { RGBELoader } from './js/RGBELoader.js';
import { OrbitControls } from './controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from './js/CSS2DRenderer.js';


let mixer, clock, renderer, scene, camera, controls, pmremGenerator, RGBE, envMap, dracoLoader, loader, model, stats, container, aktuelleAnimation;

let labelRenderer;

var arToolkitSource, arToolkitContext;

var markerRoot1;

var mesh1;



//container = document.getElementById( 'container' );


var slider = document.getElementById("sliderid");

let ClipDuration;
let sliderConverted;

var PlayButton = document.getElementsByClassName("playpause");
let timeCapture = 0;
var ARbutton = document.getElementsByClassName("AR-btn");

var x;
let ARon = false;
let PlayOn = false;
let SLIDERon = false;

let sliderpos = document.querySelector("input[type='range']");

let loadingCanvas = document.getElementsByClassName("loading");


var label;
var text;

var points;
var material;
var transmaterial;
var geometry;
var line;

let ChildPos;
let ChildCount;
let ChildCountER;

let AnimationCount; 

let TextPos = new THREE.Vector3();
let allLabels;
let labelgroup = new THREE.Group();
let TextPosVector = new THREE.Vector3(3,2,3);
let showLabels = true;
let distancefaktor=0;
let i=0;
let newtextpos=new THREE.Vector3();
let newchildpos=new THREE.Vector3();

let loadingStautus =  new THREE.LoadingManager();

init();
animate();






export function testAR(){
    let ARbuttonContent = parent.document.getElementById("ARbtn");
    console.log(ARbuttonContent.name);

    if (ARbuttonContent.name == "off") {
        ARon = false;
        init();
        animate();

        
    } 

    if (ARbuttonContent.name == "on") {
        ARon = true;
        init();
        animate();
    } 
   /*
            for (let x = 0; x < ARbutton.length; x++) {
                ARbutton[x].addEventListener('click',function() {
                    this.classList.toggle("checked");
                    ARon = !ARon;
                    
                    
                    if (ARon == false) {
                        
                        
                      } else {
                        
                     }
                    
                });
            }
            */
}

export function init() {


			
	clock = new THREE.Clock();
	//deltaTime = 0;
	//totalTime = 0;
	
		
	
	/*
	if (typeof stats !== 'undefined')
	{
		container.removeChild(stats.dom)
	}
	stats = new Stats();
	container.appendChild( stats.dom );
    */
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
	



    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild( labelRenderer.domElement );


	scene = new THREE.Scene();

    if (ARon == true) {

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
            cameraParametersUrl: '../../data/camera_para.dat',
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
        //markerRoot1.add(scene);
        
        let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
            type: 'pattern', patternUrl: "../../data/Testmaker.patt",
        })

        }

    if (ARon == false) {
        camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
        camera.position.set( 5, 2, 8 );
    
        controls = new OrbitControls( camera, renderer.domElement );
        controls.target.set( 0, 0, 0 );
        controls.update();
        controls.enablePan = false;
        controls.enableDamping = true;
        
        scene.add(camera);
    }

    pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();
			
	RGBE = new RGBELoader(loadingStautus)
	RGBE.setDataType( THREE.UnsignedByteType )
	RGBE.setPath( '../../textures/equirectangular/' )
	RGBE.load( 'studio_small_08_4k.hdr', function ( texture ) {

		envMap = pmremGenerator.fromEquirectangular( texture ).texture;
        
        if (ARon == false) {
            scene.background = new THREE.Color( 0x2ffffff );
		    //scene.background = envMap;
        }
		scene.environment = envMap;

		texture.dispose();
		pmremGenerator.dispose();

	});
					
	dracoLoader = new DRACOLoader(loadingStautus);
	dracoLoader.setDecoderPath( 'js/draco/gltf/' );
//loadGLTF('./models/1.gltf'); ///why DAS???
		

}

			

export function loadGLTF( pfad ) {
   

    let loadingStautus =  new THREE.LoadingManager();
    loadingStautus.onStart = function ( url, itemsLoaded, itemsTotal ) {

		console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

		};

		loadingStautus.onLoad = function ( ) {

			console.log( 'Loading complete!');
            //console.log(loadingCanvas[0].classList.toggle("checked"))
            setTimeout(function() {
                loadingCanvas[0].classList.toggle("checked");
            }, 50);
            
		};

/*
        loadingStautus.onProgress = function ( url, itemsLoaded, itemsTotal ) {

      console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );

    };
    
*/



	
    if (ARon == true) {
        while(markerRoot1.children.length > 0){ 
            markerRoot1.remove(markerRoot1.children[0]); 
        }
    }
	

	loader = new GLTFLoader(loadingStautus)
			
	loader.setDRACOLoader( dracoLoader );
	loader.load(
				
		pfad,
		function (gltf) {
			
			
				
			model = gltf.scene;
			model.position.set( 0, 0, 0 );
			model.scale.set( 1, 1, 1 );

            //console.log(model.getObjectByName("Sphere").parent.children[0].position);

            
            ChildCount = Object.keys(model.children).length;
            //console.log(Object.keys(model.children).length);
            

			


            if (ARon == true) {
                markerRoot1.add(model);
                markerRoot1.add(labelgroup);
            }
            if (ARon == false) {
                scene.add( model );
                scene.add(labelgroup);
            }
            

           // console.log(model.children)
            //console.log(Object.keys(gltf.animations).length)
            AnimationCount = Object.keys(gltf.animations).length;

			mixer = new THREE.AnimationMixer( scene );
            
            ClipDuration = mixer.clipAction( gltf.animations[ 0 ] ).getClip();
            //console.log(Object.values(ClipDuration)[2]);
           
            for ( ChildCountER = 0; ChildCountER < AnimationCount; ChildCountER++) {
            
           // if (Object.values(mixer.clipAction( gltf.animations[ ChildCountER ]))[21] == true){
               
                mixer.clipAction( gltf.animations[ ChildCountER] ).play();
                
           // }
                
            
            
            //console.log( Object.entries(gltf.animations[1]))
            //console.log (gltf.animations)

            
            
            
           }
           for ( ChildCountER = 0; ChildCountER < ChildCount; ChildCountER++) {
            onstopInfotextInit();
           }
            
		    requestAnimationFrame(animate);

             


			
		
		},
		/*		
		//check loaded satus		
		(xhr) => {
			console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
		},
		(error) => {
			console.log(error)
		}
        */
	)

}










 function render() {	
	renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
    
}


 function animate() {
     
	if (typeof aktuelleAnimation !== 'undefined')
	{
	  cancelAnimationFrame(aktuelleAnimation)
	}

	aktuelleAnimation = requestAnimationFrame(animate);
	
    if (ARon == true) {
        update(); 
    }
    if (ARon == false) {
        controls.update();
       
    }
	
	timer();
	render();
	//stats.update();
    //console.log(SLIDERon); 
    //console.log(PlayOn);
    //console.log(timeCapture);
    //console.log(sliderpos.value);
}


function timer()
{
    
    onstopInfotext() ;
    //console.log(PlayOn);
  const delta = clock.getDelta();
  if (typeof mixer !== 'undefined')
  {

    if (PlayOn == false && SLIDERon == false) {
        mixer.setTime(timeCapture);
        
        

        }

    if (PlayOn == false && SLIDERon == true) {
        timeCapture = sliderConverted;
            
            }


    if (SLIDERon == true) {
        mixer.setTime(sliderConverted);
        
    }
    

    if (SLIDERon == false && PlayOn == true) {
        
        mixer.update( delta );
        
        sliderpos.value = mixer.time/Object.values(ClipDuration)[2]*100;  
       
        if (mixer.time > Object.values(ClipDuration)[2]) {
            mixer.time = 0;

        }
    
    }
   
    
    
    //console.log(mixer.time);
  }
}

function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );	
}





export function slidercontent(){

    //console.log(Object.values(slider)[2]);
   
    slider.oninput = function() {
        Object.values(ClipDuration)[2]
        sliderConverted = slider.value*Object.values(ClipDuration)[2]/100;           
        //console.log((slider.value)*Object.values(ClipDuration)[2]/100);
    }
   slider.onmousedown = function() {
    SLIDERon = !SLIDERon;
    showLabels = !showLabels;
    if (PlayOn == true){
        showLabels = false;
    }
    if (PlayOn == false){
        allLabels = document.getElementsByClassName("label");
            
        for (let i=0; i < ChildCount; i++) {
            allLabels[i].classList.toggle("hide");
            //console.log(i);
        } 
    }

    
   }
   slider.onmouseup = function() {
    SLIDERon = !SLIDERon;
    showLabels = !showLabels;
    
    if (PlayOn == true){
        showLabels = false;
    }

    if (PlayOn == false){
        allLabels = document.getElementsByClassName("label");
            
        for (let i=0; i < ChildCount; i++) {
            allLabels[i].classList.toggle("hide");
            //console.log(i);
        }  
    }
    
   }  
}

export function playpause (){

   
    sliderpos.value =0;
    for (let  p = 0; p < 1; p++) {
        PlayButton[p].addEventListener('click',function() {
            this.classList.toggle("checked");
            
            allLabels = document.getElementsByClassName("label");
            
            for (let i=0; i < ChildCount; i++) {
                allLabels[i].classList.toggle("hide");
                //console.log(i);
            }
            
            //console.log(allLabels);
            //console.log(text);
            
            showLabels = !showLabels;

            
            PlayOn = !PlayOn;
            if ( PlayOn == false){
                
                timeCapture = mixer.time;
                
                
            }
            if (PlayOn == true){
                
                   
                
                
            }
            
            
        });
    }
    
}





export function onstopInfotextInit() {



    //for ( let C = 0; C < ChildCount; C++) {

        
        ChildPos =  model.children[ChildCountER].position;
       
        //direction.subVectors( WorldOrigin, ChildPos ).normalize();
        //TextPos.copy( WorldOrigin ).addScaledVector( direction, distance );
        //console.log(console.log(ChildCountER););
        
        
        TextPos.copy(ChildPos).multiply(TextPosVector);
        
        text = document.createElement( 'div' );
        text.setAttribute("class", "label");
       
        
        text.textContent = model.children[ChildCountER].userData.name;
        //console.log(model.children[ChildCountER].userData.name);
        label = new CSS2DObject( text );
        label.position.copy( TextPos);
          
        material = new THREE.LineBasicMaterial({
            color: 0x3f3f3f, 
            transparent: true,
            opacity: 1
        });

        transmaterial = new THREE.LineBasicMaterial({
            color: 0xff0000, 
            transparent: true,
            opacity: 0
        });
            
            
        
        //console.log(text.classList.toggle);
        
        points = [TextPos, ChildPos]; 
        geometry = new THREE.BufferGeometry()
        geometry.setFromPoints( points );
        line = new THREE.Line( geometry, material );
      
        labelgroup.add (line, label);
          
        
/* 
        while(scene.children.length > (C+1)*2+2){ 
            scene.remove(scene.children[2]); 
            }
    */
    //}
}



export function onstopInfotext() {

   
    for ( let C = 0; C < ChildCount; C++) {

        
        

      

        ChildPos =  model.children[C].position;
        TextPos.copy(ChildPos).multiply(TextPosVector);
        //direction.subVectors( WorldOrigin, ChildPos ).normalize();
        //TextPos.copy( WorldOrigin ).addScaledVector( direction, distance );
           
          
        labelgroup.children[(C+1)*2-1].position.copy(TextPos) ;
        
       
            //labelgroup.children[(C*2].position.copy(TextPos) ;
            //label.position.copy(TextPos) ;
            //console.log(label.position)  
            //console.log(allLabels);
           // console.log( TextPos) 
            //console.log(labelgroup.children);
            //console.log(document.getElementById(C)) 
        
        //newpos = newpos.lerp(TextPos,.11);
        //console.log(newpos.parent);
        
        
        //console.log(labelgroup)
        

        newtextpos.copy(TextPos);
        newchildpos.copy(ChildPos);
        
        if (showLabels == true && i>0){
            
            distancefaktor=i/100;
            newchildpos.lerp(newtextpos, distancefaktor);
            i--;
            points = [newtextpos, newchildpos]; 
        
        labelgroup.children[C*2].geometry.setFromPoints( points );

        //text.style.opacity = opacityfact = 1;
        }
            //console.log(showLabels)
        if (i==100){
            //console.log(line.material);
            points = [TextPos, TextPos]; 
        
        labelgroup.children[C*2].geometry.setFromPoints( points );
        }
        
        if (showLabels == false && i<100){
            
            distancefaktor=i/100;
            newchildpos.lerp(newtextpos, distancefaktor);
            i++;
            points = [TextPos, newchildpos]; 
        
        labelgroup.children[C*2].geometry.setFromPoints( points );

        //text.style.opacity = opacityfact = 0;
        }

        
        if (i==0){
            points = [ChildPos, TextPos]; 
            labelgroup.children[C*2].geometry.setFromPoints( points );
            //console.log("test")
            //showLabel();
        }
        
        //console.log(distancefaktor);
        
        //text.style.opacity="0";
       
       // while(scene.children.length > (C+1)*2+2){ 
      //      scene.remove(scene.children[2]); 
      //      }
    //console.log(TextPos);
    }
}



