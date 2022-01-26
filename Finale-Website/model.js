import * as THREE from './build/three.module.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import { DRACOLoader } from './js/DRACOLoader.js';
import { RGBELoader } from './js/RGBELoader.js';
import { OrbitControls } from './controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from './js/CSS2DRenderer.js';

let WebsiteName = window.location.pathname;
WebsiteName = WebsiteName.replace("/Finale-Website/", "");
WebsiteName = WebsiteName.replace(".html", "");


let Dateipfad = "./models/"+WebsiteName+".gltf"
let Framerate = 24;
let FilterLabelBy= "";


let clock, renderer,scene, camera, controls, pmremGenerator, RGBE, dracoLoader, loader, model, mixer;

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

export function init(){

    clock = new THREE.Clock();
    sliderpos.value = 0;
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
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
            

            Objectcounter = model.children.length;
            labelinit();

            
            
                
                if (gltf.animations.length > 0){

                
                document.getElementsByClassName("playsliderbar")[0].classList.toggle("checked");
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

    controls.minDistance = 5;
    controls.maxDistance = 50;

    pmremGenerator = new THREE.PMREMGenerator( renderer );
    pmremGenerator.compileEquirectangularShader();
        
            
     
            
    window.addEventListener('resize', onWindowResize, false)
    
    animate();

}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
     
    labelRenderer.setSize(window.innerWidth, window.innerHeight);     
    renderer.setSize(window.innerWidth, window.innerHeight);
    
          
 
                
                
}
            

let timeCapture=0;

function animate(){

    requestAnimationFrame( animate );
    sliderObserver();
    playerObserver();


    
    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
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


export function timestamps() {
    let stampmark = [];
    let stamps = document.getElementById("stamps");
    let stampcount = stamps.children.length;
    
    let FramesTotal = ClipDuration.duration*Framerate;
    //console.log(ClipDuration.duration*Framerate)
    
        for (let o = 0; o < stampcount; o++){
            let stampcurent = stamps.children[o].id;
            console.log(stampcurent)
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
            scene.add(label, line);


        }
    }
}











function labelupdate() {
    if (label !== "undefined") {
        let x = 1;
        let y = 2;
        for (let p = 0; p < Objectcounter; p++) {

            if (model.children[p].userData.name.includes(FilterLabelBy)) {

                ObjectOrigin = model.children[p].position;
                LabelPos.copy(ObjectOrigin).multiply(LabelVector);
                
                if (x < label.parent.children.length) {
                    
                    label.parent.children[x].position.copy(LabelPos);
                    x= x+2;
                }

                if (y < label.parent.children.length) {



                    Hideline();
                    //console.log(label.parent.children[y])
                    //points = [newObjectOrigin, newLabelPos];
                    label.parent.children[y].geometry.setFromPoints( points );
                    y= y+2;








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


    