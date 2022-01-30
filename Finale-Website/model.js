import * as THREE from './build/three.module.js';

import { GLTFLoader } from './js/GLTFLoader.js';
import { DRACOLoader } from './js/DRACOLoader.js';
import { RGBELoader } from './js/RGBELoader.js';
import { OrbitControls } from './controls/OrbitControls.js';
//import { CSS2DRenderer, CSS2DObject } from './js/CSS2DRenderer.js';
import { CSS2DRenderer, CSS2DObject } from './js/CSS2DRendererAlt.js';



let WebsiteName = window.location.pathname;
WebsiteName = WebsiteName.replace("/Finale-Website/", "");
WebsiteName = WebsiteName.replace("/", "");
WebsiteName = WebsiteName.replace(".html", "");

console.log(WebsiteName)
let Dateipfad = "./models/"+WebsiteName+".gltf"
let Framerate = 24;
let FilterLabelBy= "label";




let labelRenderer;
let label;
let LabelVector = new THREE.Vector3(3,2,3);
let ObjectOrigin = new THREE.Vector3(); 
let LabelPos = new THREE.Vector3();
let material = new THREE.LineBasicMaterial({
    color: 0x949494, 
    linewidth: 2,

    
});
let line;
let points;
let geometry;
let distance=0;
let i =0;
let newLabelPos=new THREE.Vector3();
    
let newObjectOrigin=new THREE.Vector3();
let hidelinestate = false;
let AnimationCount, ClipDuration;
let Objectcounter;



let sliderpos = document.querySelector("input[type='range']");
let PlayButton = document.getElementsByClassName("playpause");

let Playstate = false;

let loadingStautus =  new THREE.LoadingManager();

let clock, renderer,scene, camera, controls, pmremGenerator, RGBE, dracoLoader, loader, model, mixer;



let ARState=false;

let ARButton = document.getElementsByClassName("ARBtn")[0];

export function ARcheckup(){

    if (ARState== true) {
        
        init();
        animate();

        
    } 

    if (ARState == false) {
       
        init();
        animate();


    }
}

ARButton.addEventListener("click", () => {
        
    if (ARButton.className == "ARBtn checked"){
        document.getElementsByClassName("loading")[0].classList.toggle("checked");
        //console.log("AR on")
        ARState = true;
        ARcheckup();
        //init();
        //playpause();
        
    }

    if (ARButton.className == "ARBtn"){
        document.getElementsByClassName("loading")[0].classList.toggle("checked");
        console.log("3D on")
        ARState = false;
        ARcheckup();
        //init();
        //playpause();
        
    }

});  


let arToolkitSource;
let arToolkitContext;
var markerRoot1;
let root = new THREE.Object3D();



function init(){



   




    if (typeof renderer !== 'undefined')
	{
       
		document.body.removeChild(renderer.domElement)
       
	}
    if (typeof labelRenderer !== 'undefined')
	{
    
        document.body.removeChild(labelRenderer.domElement)
	}
    

    if (ARState == true) {
        while(root.children.length > 0){ 
            root.remove(root.children[0]); 
        }
    }

    clock = new THREE.Clock();
    sliderpos.value = 0;
    scene = new THREE.Scene();

    if (ARState == true) {


        camera = new THREE.Camera();
        
        scene.add(camera);
        console.log()
        
        ////////////////////////////////////////////////////////////
        // setup arToolkitSource
        ////////////////////////////////////////////////////////////

        arToolkitSource = new THREEx.ArToolkitSource({
            sourceType : 'webcam',
        });
        

        

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
            
            cameraParametersUrl: './data/camera_para.dat',

            detectionMode: 'mono',
            //maxDetectionRate: 60,
            /*
            canvasWidth: 480,
            canvasHeight: 640,
            imageSmoothingEnabled : true,
        }, {
            sourceWidth: 480,
            sourceHeight: 640,
            */
        })
        
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
        scene.add(root);
        let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, root, {
            //type: 'pattern', patternUrl: "../../data/Testmaker.patt",
            type : 'pattern',
            patternUrl : './data/Testmaker.patt',
            //changeMatrixMode: 'cameraTransformMatrix',
            /*
            smooth: true,
            // number of matrices to smooth tracking over, more = smoother but slower follow
            smoothCount: 5,
            // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
            smoothTolerance: 0.1,
            // threshold for smoothing, will keep still unless enough matrices are over tolerance
            smoothThreshold: 2,
            */
            
        })

        
        

    }


    if (ARState == false) {
        camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
        camera.position.set( 5, 2, 8 );
        
        scene.add(camera)
        console.log(camera)   
   
    }
        
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
       
       if (ARState == true) {
            setTimeout(function() {
                let loadingCanvas = document.getElementsByClassName("loading");
                loadingCanvas[0].classList.toggle("checked");
                console.log(loadingCanvas[0])
                
            }, 7500);
       } 

       if (ARState == false) {
            setTimeout(function() {
                let loadingCanvas = document.getElementsByClassName("loading");
                loadingCanvas[0].classList.toggle("checked");
                console.log(loadingCanvas[0])
                
            }, 50);
        } 
        
        
    };



    dracoLoader = new DRACOLoader(loadingStautus);
	dracoLoader.setDecoderPath( 'js/draco/gltf/' );

    


    loader = new GLTFLoader(loadingStautus)
    
    loader.setDRACOLoader( dracoLoader );
    loader.load(

        
        Dateipfad,
        function (gltf) {
                         
            model = gltf.scene;

            Objectcounter = model.children.length;  
            labelinit();

            if(ARState == false){
                
            model.position.set( 0, 0, 0 );
            model.scale.set( .5, .5, .5 );
            scene.add( model );
            
            }
            

            

            //
            
            if (ARState == true) {
                scene.visible = false 
                //root.matrixAutoUpdate = false;
                
                
                
                
                root.add(model);
                
            }


            console.log("changeilkj")
            
           
           
            
            
            
                
                if (gltf.animations.length > 0){

                if (ARState == false){
                document.getElementsByClassName("playsliderbar")[0].classList.toggle("checked");
                }
                AnimationCount = Object.keys(gltf.animations).length;
               
                mixer = new THREE.AnimationMixer( scene );

                

                
               
                ClipDuration = mixer.clipAction( gltf.animations[ 0 ] ).getClip();
                
                //console.log( Object.values(ClipDuration)[2])
                
                for ( let y = 0; y < AnimationCount; y++) {
                
                    
                    mixer.clipAction( gltf.animations[y] ).play();
                    //console.log(Object.values(mixer.clipAction( gltf.animations[y]))[1])
                    timestamps();

                }
            
            }
        });


    


    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
   
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.zIndex = '-1';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild( labelRenderer.domElement );





    renderer = new THREE.WebGLRenderer({
        antialias : true,
        alpha: true,
        logarithmicDepthBuffer: true,
        
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

    controls.minDistance = 5;
    controls.maxDistance = 50;

    pmremGenerator = new THREE.PMREMGenerator( renderer );
    pmremGenerator.compileEquirectangularShader();
        
            
     
       
    window.addEventListener('resize', onWindowResize, false)
    
    //animate();
    

}



function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
    
     
    labelRenderer.setSize(window.innerWidth, window.innerHeight);     
    renderer.setSize(window.innerWidth, window.innerHeight);
                  
}
            
function onResize()
        {
            arToolkitSource.onResizeElement()	
            arToolkitSource.copyElementSizeTo(renderer.domElement)	
            if ( arToolkitContext.arController !== null )
            {
                arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)	
            }	
        }


let timeCapture=0;

function animate(){

//console.log(document)

    if (ARState == true) {
        

        update(); 
      
        requestAnimationFrame( animate );
        sliderObserver();
        playerObserver();
    
    }
    if (ARState == false) {
        
        controls.update();
        requestAnimationFrame( animate );
        sliderObserver();
        playerObserver();
        
       
    }

    arObserver();


renderer.render( scene, camera );
labelRenderer.render( scene, camera );

}


function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );	
        onResize();
        scene.visible = camera.visible;  

}

function playerObserver(){
    //timeCapture = mixer.time;
    const delta = clock.getDelta();
    
    

    if (typeof mixer !== 'undefined'){

        if (Playstate == true) {
            
            mixer.update( delta );
            labelupdate();
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
    labelupdate();
    slider.onpointerdown = function() {
        
        if (Playstate==true){
            Playstate=false;
            PlayButton[0].classList.toggle("checked");       
        }
        hidelinestate = true;
        for (let p = 0; p < Objectcounter; p++){
            if (document.getElementsByClassName("label")[p] != undefined){
                document.getElementsByClassName("label")[p].classList.toggle("checked");
                
                
            }  
            
        }    
    }


    slider.onpointerup = function() {
        
        
        hidelinestate = false;
        for (let p = 0; p < Objectcounter; p++){
            if (document.getElementsByClassName("label")[p] != undefined){
                document.getElementsByClassName("label")[p].classList.toggle("checked");
                
                
            }   
        }    
    }

    slider.oninput = function() {
        Object.values(ClipDuration)[2]
        let sliderConverted = slider.value*Object.values(ClipDuration)[2]/100;           
        //console.log(sliderConverted);
        timeCapture = sliderConverted;
        
        Hideline();
        
    }
}


function timestamps() {
    let stampmark = [];
    let stamps = document.getElementById("stamps");
    let stampcount = stamps.children.length;
    
    let FramesTotal = ClipDuration.duration*Framerate;
    //console.log(ClipDuration.duration*Framerate)
    
        for (let o = 0; o < stampcount; o++){
            let stampcurent = stamps.children[o].id;
            //console.log(stampcurent)
            //console.log(stampcurent)
            stamps.children[o].style.left = ""+(stampcurent)+"%"; 
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
        hidelinestate = !hidelinestate;

        for (let p = 0; p < Objectcounter; p++){
            if (document.getElementsByClassName("label")[p] != undefined){
                document.getElementsByClassName("label")[p].classList.toggle("checked");
                Hideline();
            }   
        }
        
    });

    
}

function labelinit() {
    console.log (Objectcounter)
    for (let p = 0; p < Objectcounter; p++){

        console.log(model.children[p].userData.name)

        if (model.children[p].userData.name.includes(FilterLabelBy)) {
            let text = document.createElement( 'div' );
            text.setAttribute("class", "label");
       
            let TextContent =  model.children[p].userData.name;
            let TextContentminusFilter = TextContent.replace(""+FilterLabelBy+"", ""); 
            text.textContent = TextContentminusFilter;

            calcLabelPoints(p);
            drawLine(p);
          

            label = new CSS2DObject( text );
            label.position.copy( LabelPos);
            //console.log(model.children[p].position)
            if (ARState == false) {
                model.add(label, line);
            }
            
            if (ARState == true) {
                model.add(label, line);
                
            }


        }
    }
}











function labelupdate() {


    
    


    if (typeof label !== "undefined") {
        
        let x = 0+Objectcounter;
        let y = 1+Objectcounter;
        
       //console.log(model)

        for (let p = 0; p < model.children.length; p++) {
            
            
            if(typeof model.children[p].userData.name !== "undefined"){
                if (model.children[p].userData.name.includes(FilterLabelBy)) {

                    //console.log(model.children[p].userData.name) 
                    ObjectOrigin = model.children[p].position;
                    LabelPos.copy(ObjectOrigin).multiply(LabelVector);

                    if (x < model.children.length){
                        model.children[x].position.copy(LabelPos);
                        x=x+2;
                        //console.log(x)
                    }

                    if (y < model.children.length){
                        Hideline();
                        model.children[y].geometry.setFromPoints( points );
                        y=y+2;
                        //console.log(x)
                    }


                }
            }

        }
        
    }

   
}



function calcLabelPoints(p) {

    ObjectOrigin = model.children[p].position;
    LabelPos.copy(ObjectOrigin).multiply(LabelVector);
       
}




function drawLine(p){

    points = [ObjectOrigin, LabelPos]; 
    geometry = new THREE.BufferGeometry()
    geometry.setFromPoints( points );
    line = new THREE.Line( geometry, material );

} 

function Hideline() {

    newLabelPos.copy(LabelPos);
    newObjectOrigin.copy(ObjectOrigin);

    if (hidelinestate == true && i<250) {
        distance=i/250;
        i++;

    
        newObjectOrigin.lerp(newLabelPos, distance);
        points = [LabelPos, newObjectOrigin]; 

    } 

    if (i==250){

        points = [LabelPos, LabelPos]; 

    }

    if (hidelinestate == false && i>0) {
        distance=i/250;
        i--;

    
        newObjectOrigin.lerp(newLabelPos, distance);
        points = [newLabelPos, newObjectOrigin]; 
    } 

    if (i==0){

        points = [ObjectOrigin, LabelPos]; 
    }

    //console.log(Playstate);

}


function arObserver() {

    if (document.getElementById("arjs-video") !== null){
        let videolayer = document.getElementById("arjs-video")
        if (ARState == true){
            videolayer.style.opacity = 1;
        }
        if (ARState == false){
            videolayer.style.opacity = 0; 
            
        }

    }
}
    
