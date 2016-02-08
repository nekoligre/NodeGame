(function(){
  var url = 'http://localhost:8000';
  
  var 
    doc = $(document),
    win = $(window),
    canvas = $('#canvas'),
    ctx = canvas[0].getContext('2d'),
    instructions = $('#instructions');

  var id = Math.round($.now()*Math.random());

  var drawing = false;

  var 
    clients = {},
    cursors = {};

  var socket = io.connect(url);

  socket.on('moving', function (data) {

    if(! (data.id in clients)){
      // a new user has come online. create a cursor for them
      cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
    }

    // Move the mouse pointer
    cursors[data.id].css({
      'left' : data.x,
      'top' : data.y
    });

    // Is the user drawing?
    if(data.drawing && clients[data.id]){

      // Draw a line on the canvas. clients[data.id] holds
      // the previous position of this user's mouse pointer

      drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
    }

    // Saving the current client state
    clients[data.id] = data;
    clients[data.id].updated = $.now();
  });

  var prev = {};

  canvas.on('mousedown',function(e){
    e.preventDefault();
    drawing = true;
    prev.x = e.pageX;
    prev.y = e.pageY;

    // Hide the instructions
    instructions.fadeOut();
  });

  doc.bind('mouseup mouseleave',function(){
    drawing = false;
  });

  var lastEmit = $.now();

  doc.on('mousemove',function(e){
    if($.now() - lastEmit > 30){
      socket.emit('mousemove',{
        'x': e.pageX,
        'y': e.pageY,
        'drawing': drawing,
        'id': id
      });
      lastEmit = $.now();
    }

    // Draw a line for the current user's movement, as it is
    // not received in the socket.on('moving') event above

    if(drawing){

      drawLine(prev.x, prev.y, e.pageX, e.pageY);

      prev.x = e.pageX;
      prev.y = e.pageY;
    }
  });

  // Remove inactive clients after 10 seconds of inactivity
  setInterval(function(){

    for(ident in clients){
      if($.now() - clients[ident].updated > 10000){
        cursors[ident].remove();
        delete clients[ident];
        delete cursors[ident];
      }
    }
  },10000);

  function drawLine(fromx, fromy, tox, toy){
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
  }

}())