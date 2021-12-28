let controllers = [];


// -------------------------------------
// ---------  READ CONTROLLER ----------------
// -------------------------------------


function readGamepadInput(){

     var gamepads = navigator.getGamepads();
 
  for (let i in controllers)
  {
    
     let cgp = gamepads[i];
    
    
    if (cgp.buttons)
    {
    
      touch1 = cgp.buttons[0];
      touch2 = cgp.buttons[1];

      
      
    }
  }
  
}


// -------------------------------------
// ---------  CONNECTION ROUTINES ----------------
// -------------------------------------

window.addEventListener("gamepadconnected", function(e) {

 
   gamepadHandler(e, true);
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length); 
  
});


window.addEventListener("gamepaddisconnected", function(e) {
  
  console.log("Gamepad disconnected from index %d: %s",
    e.gamepad.index, e.gamepad.id);      
   
    gamepadHandler(e, false);
  
  }); 


function gamepadHandler(event, connecting) {
  let gamepad = event.gamepad;
  if (connecting) {
 		
    print("Connecting to controller "+gamepad.index)
    controllers[gamepad.index] = gamepad
  } else {
    delete controllers[gamepad.index]
  }
}
