const Game = function() {

  this.world    = new Game.World();

  this.update   = function() {

    this.world.update();

  };

};

Game.prototype = {

  constructor : Game,

};

Game.World = function(friction = 0.8, gravity = 2) {

  this.collider = new Game.World.Collider();

  this.friction = friction;
  this.gravity  = gravity;

  this.columns   = 12;
  this.rows      = 9;


  this.tile_set = new Game.World.TileSet(8, 16);
  this.player   = new Game.World.Object.Player(100, 100);

  this.map = [04,17,17,17,17,17,17,17,17,17,17,05,
              10,46,46,46,46,46,46,46,46,46,46,08,
              10,46,46,46,46,46,46,46,46,46,46,08,
              10,46,46,46,46,46,46,46,46,46,46,08,
              10,46,46,46,46,46,46,46,46,46,24,09,
              10,46,46,46,46,46,24,01,02,46,46,08,
              10,46,46,46,46,46,46,08,09,26,46,08,
              10,46,46,00,01,02,46,08,10,46,46,08,
              12,01,01,13,09,12,01,13,12,01,01,13];

  this.collision_map = [04,17,17,17,17,17,17,17,17,17,17,05,
                        10,46,46,46,46,46,46,46,46,46,46,08,
                        10,46,46,46,46,46,46,46,46,46,46,08,
                        10,46,46,46,46,46,46,46,46,46,46,08,
                        10,46,46,46,46,46,46,46,46,46,24,09,
                        10,46,46,46,46,46,24,01,02,46,46,08,
                        10,46,46,46,46,46,46,08,09,26,46,08,
                        10,46,46,00,01,02,46,08,10,46,46,08,
                        12,01,01,13,09,12,01,13,12,01,01,13];

  this.height   = this.tile_set.tile_size * this.rows;   
  this.width    = this.tile_set.tile_size * this.columns;

};

Game.World.prototype = {

  constructor: Game.World,

  collideObject:function(object) {

    if      (object.getLeft()   < 0          ) { object.setLeft(0);             object.velocity_x = 0; }
    else if (object.getRight()  > this.width ) { object.setRight(this.width);   object.velocity_x = 0; }
    if      (object.getTop()    < 0          ) { object.setTop(0);              object.velocity_y = 0; }
    else if (object.getBottom() > this.height) { object.setBottom(this.height); object.velocity_y = 0; object.jumping = false; }

    var bottom, left, right, top, value;

    top    = Math.floor(object.getTop()    / this.tile_set.tile_size);
    left   = Math.floor(object.getLeft()   / this.tile_set.tile_size);
    value  = this.collision_map[top * this.columns + left];
    this.collider.collide(value, object, left * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

    top    = Math.floor(object.getTop()    / this.tile_set.tile_size);
    right  = Math.floor(object.getRight()  / this.tile_set.tile_size);
    value  = this.collision_map[top * this.columns + right];
    this.collider.collide(value, object, right * this.tile_set.tile_size, top * this.tile_set.tile_size, this.tile_set.tile_size);

    bottom = Math.floor(object.getBottom() / this.tile_set.tile_size);
    left   = Math.floor(object.getLeft()   / this.tile_set.tile_size);
    value  = this.collision_map[bottom * this.columns + left];
    this.collider.collide(value, object, left * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);

    bottom = Math.floor(object.getBottom() / this.tile_set.tile_size);
    right  = Math.floor(object.getRight()  / this.tile_set.tile_size);
    value  = this.collision_map[bottom * this.columns + right];
    this.collider.collide(value, object, right * this.tile_set.tile_size, bottom * this.tile_set.tile_size, this.tile_set.tile_size);

  },


  update:function() {

    this.player.updatePosition(this.gravity, this.friction);

    this.collideObject(this.player);

    this.player.updateAnimation();

  }

};

Game.World.Collider = function() {

  this.collide = function(value, object, tile_x, tile_y, tile_size) {

    switch(value) {

      case  0:  if (this.collidePlatformTop        (object, tile_y            )) return;
                this.collidePlatformLeft           (object, tile_x            ); break;
      case  1:  this.collidePlatformTop            (object, tile_y            ); break;
      case  2:  if (this.collidePlatformTop        (object, tile_y            )) return;
                this.collidePlatformRight          (object, tile_x + tile_size); break;
      case  8:  this.collidePlatformLeft           (object, tile_x            ); break;
      case  10: this.collidePlatformRight          (object, tile_x + tile_size); break;
      case  17: this.collidePlatformBottom         (object, tile_y +tile_size ); break;
      case  24: if (this.collidePlatformTop        (object, tile_y            )) return;
                if (this.collidePlatformBottom     (object, tile_y +tile_size)) return;
                this.collidePlatformLeft           (object, tile_x            ); break;
      case  26: if (this.collidePlatformTop        (object, tile_y            )) return;
                if (this.collidePlatformBottom     (object, tile_y +tile_size)) return;
                this.collidePlatformRight          (object, tile_x            ); break;

    }

  }

};

Game.World.Collider.prototype = {

  constructor: Game.World.Collider,

  collidePlatformBottom:function(object, tile_bottom) {

    if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {

      object.setTop(tile_bottom);
      object.velocity_y = 0;
      return true;

    } return false;

  },

  collidePlatformLeft:function(object, tile_left) {

    if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {

      object.setRight(tile_left - 0.01);
      object.velocity_x = 0;
      return true;

    } return false;

  },

  collidePlatformRight:function(object, tile_right) {

    if (object.getLeft() < tile_right && object.getOldLeft() >= tile_right) {

      object.setLeft(tile_right);
      object.velocity_x = 0;
      return true;

    } return false;

  },

  collidePlatformTop:function(object, tile_top) {

    if (object.getBottom() > tile_top && object.getOldBottom() <= tile_top) {

      object.setBottom(tile_top - 0.01);
      object.velocity_y = 0;
      object.jumping    = false;
      return true;

    } return false;

  }

 };

Game.World.Object = function(x, y, width, height) {

 this.height = height;
 this.width  = width;
 this.x      = x;
 this.x_old  = x;
 this.y      = y;
 this.y_old  = y;

};

Game.World.Object.prototype = {

  constructor:Game.World.Object,

  /* These functions are used to get and set the different side positions of the object. */
  getBottom:   function()  { return this.y     + this.height; },
  getLeft:     function()  { return this.x;                   },
  getRight:    function()  { return this.x     + this.width;  },
  getTop:      function()  { return this.y;                   },
  getOldBottom:function()  { return this.y_old + this.height; },
  getOldLeft:  function()  { return this.x_old;               },
  getOldRight: function()  { return this.x_old + this.width;  },
  getOldTop:   function()  { return this.y_old                },
  setBottom:   function(y) { this.y     = y    - this.height; },
  setLeft:     function(x) { this.x     = x;                  },
  setRight:    function(x) { this.x     = x    - this.width;  },
  setTop:      function(y) { this.y     = y;                  },
  setOldBottom:function(y) { this.y_old = y    - this.height; },
  setOldLeft:  function(x) { this.x_old = x;                  },
  setOldRight: function(x) { this.x_old = x    - this.width;  },
  setOldTop:   function(y) { this.y_old = y;                  }

};

Game.World.Object.Animator = function(frame_set, delay) {

  this.count       = 0;
  this.delay       = (delay >= 1) ? delay : 1;
  this.frame_set   = frame_set;
  this.frame_index = 0;
  this.frame_value = frame_set[0];
  this.mode        = "pause";

};

Game.World.Object.Animator.prototype = {

  constructor:Game.World.Object.Animator,

  animate:function() {

    switch(this.mode) {

      case "loop" : this.loop(); break;
      case "pause":              break;

    }

  },

  changeFrameSet(frame_set, mode, delay = 10, frame_index = 0) {

    if (this.frame_set === frame_set) { return; }

    this.count       = 0;
    this.delay       = delay;
    this.frame_set   = frame_set;
    this.frame_index = frame_index;
    this.frame_value = frame_set[frame_index];
    this.mode        = mode;

  },

  loop:function() {

    this.count ++;

    while(this.count > this.delay) {

      this.count -= this.delay;

      this.frame_index = (this.frame_index < this.frame_set.length - 1) ? this.frame_index + 1 : 0;

      this.frame_value = this.frame_set[this.frame_index];

    }

  }

};


Game.World.Object.Player = function(x, y) {

  Game.World.Object.call(this, 100, 100, 7, 14);
  Game.World.Object.Animator.call(this, Game.World.Object.Player.prototype.frame_sets["idle-left"], 10);

  this.jumping     = true;
  this.direction_x = -1;
  this.velocity_x  = 0;
  this.velocity_y  = 0;

};

Game.World.Object.Player.prototype = {

  constructor:Game.World.Object.Player,


  frame_sets: {

    "idle-left" : [0],
    "jump-left" : [1],
    "move-left" : [2, 3, 4, 5, 6],
    "idle-right": [7],
    "jump-right": [8],
    "move-right": [9, 10, 11, 12, 13, 14]

  },

  jump: function() {

    if (!this.jumping) {

      this.jumping     = true;
      this.velocity_y -= 20;

    }

  },

  moveLeft: function() {

    this.direction_x = -1;
    this.velocity_x -= 0.55;

  },

  moveRight:function(frame_set) {

    this.direction_x = 1;
    this.velocity_x += 0.55;

  },


  updateAnimation:function() {

    if (this.velocity_y < 0) {

      if (this.direction_x < 0) this.changeFrameSet(this.frame_sets["jump-left"], "pause");
      else this.changeFrameSet(this.frame_sets["jump-right"], "pause");

    } else if (this.direction_x < 0) {

      if (this.velocity_x < -0.1) this.changeFrameSet(this.frame_sets["move-left"], "loop", 5);
      else this.changeFrameSet(this.frame_sets["idle-left"], "pause");

    } else if (this.direction_x > 0) {

      if (this.velocity_x > 0.1) this.changeFrameSet(this.frame_sets["move-right"], "loop", 5);
      else this.changeFrameSet(this.frame_sets["idle-right"], "pause");

    }

    this.animate();

  },

  
 
  updatePosition:function(gravity, friction) {

    this.x_old = this.x;
    this.y_old = this.y;
    this.velocity_y += gravity;
    this.x    += this.velocity_x;
    this.y    += this.velocity_y;

    this.velocity_x *= friction;
    this.velocity_y *= friction;

  }

};


Object.assign(Game.World.Object.Player.prototype, Game.World.Object.prototype);
Object.assign(Game.World.Object.Player.prototype, Game.World.Object.Animator.prototype);
Game.World.Object.Player.prototype.constructor = Game.World.Object.Player;


Game.World.TileSet = function(columns, tile_size) {

  this.columns    = columns;
  this.tile_size  = tile_size;

  let f = Game.World.TileSet.Frame;

  /* An array of all the frames in the tile sheet image. */
  this.frames = [new f(  16,  64, 16, 16, 0, -2), // idle-left
                 new f( 96,  64, 16, 16, 0, -2), // jump-left
                 new f( 16,  96, 16, 16, 0, -2), new f(32, 96, 16, 16, 0, -2), new f(48, 96, 16, 16, 0, -2), new f(64, 96, 16, 16, 0, -2), new f(80, 96, 16, 16, 0, -2), // walk-left
                 new f(  0, 64, 16, 16, 0, -2), // idle-right
                 new f( 80, 64, 16, 16, 0, -2), // jump-right
                 new f( 16, 80, 16, 16, 0, -2), new f(32, 80, 16, 16, 0, -2), new f(48, 80, 16, 16, 0, -2), new f(64, 80, 16, 16, 0, -2), new f(80, 80, 16, 16, 0, -2), new f(96, 80, 16, 16, 0, -2) // walk-right
                ];

};

Game.World.TileSet.prototype = { constructor: Game.World.TileSet };

Game.World.TileSet.Frame = function(x, y, width, height, offset_x, offset_y) {

  this.x        = x;
  this.y        = y;
  this.width    = width;
  this.height   = height;
  this.offset_x = offset_x;
  this.offset_y = offset_y;

};

Game.World.TileSet.Frame.prototype = { constructor: Game.World.TileSet.Frame };
// const Game = function() {

//   this.world = new Game.World();

//   this.update = function() {

//     this.world.update();
//   };
// };

// Game.prototype = { constructor : Game };

// Game.World = function(friction = 0.9, gravity = 3) {

//   this.collider = new Game.World.Collider();

//   this.friction = friction;
//   this.gravity  = gravity;

//   this.player   = new Game.World.Player();

//   this.columns   = 12;
//   this.rows      = 9;
//   this.tile_size = 16;

//   this.map = [05,18,18,18,18,18,18,18,18,18,18,06,
//               11,47,47,47,47,47,47,47,47,47,47,09,
//               11,47,47,47,47,47,47,47,47,47,47,09,
//               11,47,47,47,47,47,47,47,47,47,47,09,
//               11,47,47,47,47,47,47,47,47,47,25,10,
//               11,47,47,47,47,47,25,02,03,47,47,09,
//               11,47,47,47,47,47,47,09,10,27,47,09,
//               11,47,47,01,02,03,47,09,11,47,47,09,
//               13,02,02,14,10,13,02,14,13,02,02,14];

//   this.collision_map = [05,18,18,18,18,18,18,18,18,18,18,06,
//                         11,47,47,47,47,47,47,47,47,47,47,09,
//                         11,47,47,47,47,47,47,47,47,47,47,09,
//                         11,47,47,47,47,47,47,47,47,47,47,09,
//                         11,47,47,47,47,47,47,47,47,47,25,10,
//                         11,47,47,47,47,47,25,02,03,47,47,09,
//                         11,47,47,47,47,47,47,09,10,27,47,09,
//                         11,47,47,01,02,03,47,09,11,47,47,09,
//                         13,02,02,14,10,13,02,14,13,02,02,14];

//   this.height   = this.tile_size * this.rows;
//   this.width    = this.tile_size * this.columns;
// };

// Game.World.prototype = {

//   constructor: Game.World,

  
//   collideObject:function(object) {


//     if      (object.getLeft()   < 0          ) { object.setLeft(0);             object.velocity_x = 0; }
//     else if (object.getRight()  > this.width ) { object.setRight(this.width);   object.velocity_x = 0; }
//     if      (object.getTop()    < 0          ) { object.setTop(0);              object.velocity_y = 0; }
//     else if (object.getBottom() > this.height) { object.setBottom(this.height); object.velocity_y = 0; object.jumping = false; }

//     var bottom, left, right, top, value;

//     top    = Math.floor(object.getTop()    / this.tile_size);
//     left   = Math.floor(object.getLeft()   / this.tile_size);
//     value  = this.collision_map[top * this.columns + left];
//     this.collider.collide(value, object, left * this.tile_size, top * this.tile_size, this.tile_size);

//     top    = Math.floor(object.getTop()    / this.tile_size);
//     right  = Math.floor(object.getRight()  / this.tile_size);
//     value  = this.collision_map[top * this.columns + right];
//     this.collider.collide(value, object, right * this.tile_size, top * this.tile_size, this.tile_size);

//     bottom = Math.floor(object.getBottom() / this.tile_size);
//     left   = Math.floor(object.getLeft()   / this.tile_size);
//     value  = this.collision_map[bottom * this.columns + left];
//     this.collider.collide(value, object, left * this.tile_size, bottom * this.tile_size, this.tile_size);

//     bottom = Math.floor(object.getBottom() / this.tile_size);
//     right  = Math.floor(object.getRight()  / this.tile_size);
//     value  = this.collision_map[bottom * this.columns + right];
//     this.collider.collide(value, object, right * this.tile_size, bottom * this.tile_size, this.tile_size);
//   },

//   update:function() {

//     this.player.velocity_y += this.gravity;
//     this.player.update();

//     this.player.velocity_x *= this.friction;
//     this.player.velocity_y *= this.friction;

//     this.collideObject(this.player);
//   }
// };

// Game.World.Collider = function() {

//   this.collide = function(value, object, tile_x, tile_y, tile_size) {

//     switch(value) { 
      
//       case  1:  if (this.collidePlatformTop        (object, tile_y            )) return;
//                 this.collidePlatformLeft           (object, tile_x            ); break;
//       case  2:  this.collidePlatformTop            (object, tile_y            ); break;
//       case  3:  if (this.collidePlatformTop        (object, tile_y            )) return;
//                 this.collidePlatformRight          (object, tile_x + tile_size); break;
//       case  9:  this.collidePlatformLeft           (object, tile_x            ); break;
//       case  11: this.collidePlatformRight          (object, tile_x + tile_size); break;
//       case  18: this.collidePlatformBottom         (object, tile_y +tile_size ); break;
//       case  25: if (this.collidePlatformTop        (object, tile_y            )) return;
//                 if (this.collidePlatformBottom     (object, tile_y +tile_size)) return;
//                 this.collidePlatformLeft           (object, tile_x            ); break;
//       case  27: if (this.collidePlatformTop        (object, tile_y            )) return;
//                 if (this.collidePlatformBottom     (object, tile_y +tile_size)) return;
//                 this.collidePlatformRight          (object, tile_x            ); break;
      
//     }
//   }
// };


// Game.World.Collider.prototype = {

//   constructor: Game.World.Collider,

//   collidePlatformBottom:function(object, tile_bottom) {

//     if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {

//       object.setTop(tile_bottom);
//       object.velocity_y = 0;
//       return true;

//     } return false;
//   },

//   collidePlatformLeft:function(object, tile_left) {

//     if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {

//       object.setRight(tile_left - 0.01);
//       object.velocity_x = 0;
//       return true;

//     } return false;
//   },

//   collidePlatformRight:function(object, tile_right) {

//     if (object.getLeft() < tile_right && object.getOldLeft() >= tile_right) {

//       object.setLeft(tile_right);
//       object.velocity_x = 0;
//       return true;

//     } return false;
//   },

//   collidePlatformTop:function(object, tile_top) {

//     if (object.getBottom() > tile_top && object.getOldBottom() <= tile_top) {

//       object.setBottom(tile_top - 0.01);
//       object.velocity_y = 0;
//       object.jumping    = false;
//       return true;

//     } return false;
//   }
//  };

// Game.World.Object = function(x, y, width, height) {

//  this.height = height;
//  this.width  = width;
//  this.x      = x;
//  this.x_old  = x;
//  this.y      = y;
//  this.y_old  = y;
// };

// Game.World.Object.prototype = {

//   constructor:Game.World.Object,

//   getBottom:   function()  { return this.y     + this.height; },
//   getLeft:     function()  { return this.x;                   },
//   getRight:    function()  { return this.x     + this.width;  },
//   getTop:      function()  { return this.y;                   },
//   getOldBottom:function()  { return this.y_old + this.height; },
//   getOldLeft:  function()  { return this.x_old;               },
//   getOldRight: function()  { return this.x_old + this.width;  },
//   getOldTop:   function()  { return this.y_old                },
//   setBottom:   function(y) { this.y     = y    - this.height; },
//   setLeft:     function(x) { this.x     = x;                  },
//   setRight:    function(x) { this.x     = x    - this.width;  },
//   setTop:      function(y) { this.y     = y;                  },
//   setOldBottom:function(y) { this.y_old = y    - this.height; },
//   setOldLeft:  function(x) { this.x_old = x;                  },
//   setOldRight: function(x) { this.x_old = x    - this.width;  },
//   setOldTop:   function(y) { this.y_old = y;                  }
// };

// Game.World.Player = function(x, y) {

//   Game.World.Object.call(this, 20, 100, 12, 12);

//   this.color1     = "#404040";
//   this.color2     = "#f0f0f0";

//   this.jumping    = true;
//   this.velocity_x = 0;
//   this.velocity_y = 0;
// };

// Game.World.Player.prototype = {

//   jump:function() {

//     if (!this.jumping) {

//       this.jumping     = true;
//       this.velocity_y -= 20;
//     }
//   },

//   moveLeft:function()  { this.velocity_x -= 0.5; },
//   moveRight:function() { this.velocity_x += 0.5; },

//   update:function() {

//     this.x_old = this.x;
//     this.y_old = this.y;
//     this.x    += this.velocity_x;
//     this.y    += this.velocity_y;
//   }
// };

// Object.assign(Game.World.Player.prototype, Game.World.Object.prototype);
// Game.World.Player.prototype.constructor = Game.World.Player;