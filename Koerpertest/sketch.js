// init the touch objects / buttons
let touch1;
let touch2;
let touch3;
let touch4;

let s;

let maintick = 0;
let acctick = 1;

let move_x = 0;
let move_y = 0;


function setup() {
  createCanvas(window.innerWidth,window.innerHeight , WEBGL);
  
 
}


function draw() {
  
 
  if(controllers.length>0){ have_controller=true; }else{ have_controller=false;}
  readGamepadInput(); // read the button and axis input if there is any
  
  
 
  
  if(touch1){
    if(touch1.pressed){
       
      move_x +=.1;
      
   }
  }
  
  if(touch3){
    if(touch3.pressed){
      
      move_x -=.1;
       
   }
  }
  
  if(touch4){
    if(touch4.pressed){
       
      acctick += .6;
      
   }
  }
 
  
  if(have_controller){
     shader(s);
  }
  s.setUniform("resolution", [width, height]);
  s.setUniform("time", maintick );
   s.setUniform("move", [move_x, .1]);
  
  
   rect(0,0,width, height);
 
    
   maintick += acctick*.01;

    acctick *=.93;
}