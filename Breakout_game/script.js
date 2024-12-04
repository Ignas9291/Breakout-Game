var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var brickTexture = new Image();
	brickTexture.src = 'brick.png';
var paddleImage = new Image();
	paddleImage.src = 'paddle.png';
var next_level_background = new Image();
	next_level_background.src = "next_level_background.jpg";
var background = new Image();
	background.src = "background.jpg";

var bounceSound = new Audio('ball_bounce.wav');
var brickHit = new Audio('brick_hit.mp3');

const ball = {
  leftCornerX: (canvas.width/2) + Math.floor(Math.random()*41)-10,
  leftCornerY: (canvas.height-30) + Math.floor(Math.random()*41)-10,
  size: 34,
  speed: 1,
  horizontalMovementDirection: 1, // default right
  verticalMovementDirection: -1,  // default up
  img: (function() {
    var img = new Image();
    img.src = 'ball.jpg';
    return img;
  })()
};

var x = (canvas.width/2) + Math.floor(Math.random()*41)-10;
var y = (canvas.height-30) + Math.floor(Math.random()*41)-10;;
var dx = ball.speed;
var dy = -1*ball.speed;
var ballRadius = ball.size;
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth)/2;
var paddleSpeed = 7;
var rightButton = false;
var leftButton = false;
var brickRowCount = 3;
var brickColumnCount = 5;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickWidth = (canvas.width/brickColumnCount) - (brickPadding);

var totalBrickWidth = (brickColumnCount * (brickWidth + brickPadding)) - brickPadding; // Total width of all bricks and paddings
var brickOffsetLeft = (canvas.width - totalBrickWidth) / 2; // Centering offset
var score = 0;
var lives = 3;
var level = 1;
var maxLevel = 5;
var pause = false;
var bricks = [];

function drawMenu(text, x, y) {
  ctx.font = "16px Century";
  ctx.fillStyle = "#a9d3e8";
  ctx.fillText(text, x, y);
}

initBricks();

function initBricks(){
  for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
      bricks[c][r] = {x:0, y:0, status:1};
    }
  }
}

 document.addEventListener("keydown", keyDownHandler);
 document.addEventListener("keyup", keyUpHandler);
 document.addEventListener("mousemove", mouseMoveHandler);

function drawBricks(){
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {

      if (bricks[c][r].status == 1) {		
        var brickX = (c*(brickWidth+brickPadding)) + brickOffsetLeft;
        var brickY = (r*(brickHeight+brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.drawImage(brickTexture, brickX, brickY, brickWidth, brickHeight);
        ctx.closePath();
      }
    }
  }
}

function keyDownHandler(e){
  if (e.keyCode == 39){
    rightButton = true;
  }
  else if (e.keyCode == 37){
    leftButton = true;
  }
}

function keyUpHandler(e){
  if (e.keyCode == 39){
    rightButton = false;
  }
  else if (e.keyCode == 37){
    leftButton = false;
  }
}

function mouseMoveHandler(e){
  var relativeX = e.clientX - canvas.offsetLeft;
  if (0 < relativeX - paddleWidth/2 && relativeX + paddleWidth/2 < canvas.width){
    paddleX = relativeX - paddleWidth/2;
  }
}

function drawBall(){
  ctx.drawImage(ball.img, x, y, ballRadius, ballRadius);
}

function drawPaddle(){
  ctx.beginPath();
  ctx.drawImage(paddleImage, paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.closePath();
}

function ballBrickCollision(){
  for (c = 0; c < brickColumnCount; c++) {
    for (r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status == 1) {
        if (
		    x + ballRadius > b.x &&    // Ball's right edge overlaps brick's left edge
			x - ballRadius < b.x + brickWidth && // Ball's left edge overlaps brick's right edge
			y + ballRadius > b.y &&    // Ball's bottom edge overlaps brick's top edge
			y < b.y + brickHeight  // Ball's top edge overlaps brick's bottom edge			
		) {
		  //brickHit.play();	
          dy = -dy;
          b.status = 0;
          score++;		 

          if (score == brickRowCount*brickColumnCount){
            if (level === maxLevel){
              alert("Victory!");
              document.location.reload();
            }
            else {
              level++;
              brickRowCount++;
              initBricks();
              score = 0;
              dx += 2;
              dy = -dy;
              dy -= 2;
              x = (canvas.width/2) + Math.floor(Math.random()*41)-10;
              y = (canvas.height-30) + Math.floor(Math.random()*41)-10;
              paddleX = (canvas.width-paddleWidth)/2;
              pause = true;
              drawPause();
              setTimeout(function(){
                pause = false;
                draw();
              }, 1500)
            }
          }
        }
      }
    }
  }
}

next_level_background.onload = function() {}

function drawPause() {
  // Draw the background image and text
  ctx.drawImage(next_level_background, 0, 0, canvas.width, canvas.height); // Draw the image covering the canvas
  ctx.font = "36px Century";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("Level " + (level - 1) + " completed", canvas.width / 2 - 150, canvas.height / 2);
}

function drawScore(){
  drawMenu("Score: " + score, 8, 20);
}

function drawLives(){
  drawMenu("Lives: " + lives, canvas.width - 65, 20);
}

function drawLevel(){
  drawMenu("Level: " + level, 210, 20);
}

function resetGameState() {
    lives--; // Decrease the number of lives
    // Reset ball position
    x = (canvas.width / 2) + Math.floor(Math.random() * 41) - 10; // Random x near center
    y = (canvas.height - ball.size) + Math.floor(Math.random() * 31) + 10;
	dx = ball.speed; // Horizontal speed
    dy = -ball.speed; // Vertical speed (negative to move up)
    // Reset paddle position
    paddleX = (canvas.width - paddleWidth) / 2;
}

function handleBallMovement() {
	x += dx;
	y += dy;
	
	  // Ball collisions with top canvas
  if (y + dy < ballRadius) {
    dy = -dy;  // Bounce off the top

  } else if (y + dy > canvas.height - ballRadius - paddleHeight) {
    if (x > paddleX && x < paddleX + paddleWidth) {
	//bounceSound.play() 
      dy = -dy;  // Ball hits the paddle
	
      console.log("paddle y: " + (10));

	  console.log("y + ballRadius: " + (y + ballRadius));

    } else {
		if (!lives){
        document.location.reload();
		}
      resetGameState();
    }
  }

  // Ball collisions with left and right wall's boundaries
	if ((x + dx < 0) || (x + dx + ballRadius > canvas.width)) { 
		dx = -dx;  // Ball bounces off the left or right side
	}

}

function handlePaddleMovement() {
  if (rightButton && (paddleX < (canvas.width - paddleWidth))) {
    paddleX += paddleSpeed;  // Move paddle right
  } else if (leftButton && (paddleX > 0)) {
    paddleX -= paddleSpeed;  // Move paddle left
  }
}

function draw(){
  clearScreen();
  drawBall();
  drawPaddle();
  drawBricks();
  drawScore();
  drawLives();
  drawLevel();
  ballBrickCollision();
  handleBallMovement()
  handlePaddleMovement()
    
  if (!pause){
    requestAnimationFrame(draw);
  }  
}

function clearScreen(){
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

draw();
