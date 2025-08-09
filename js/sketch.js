let points = [];
let isDrawing = false;
let score = 0;
let canvas;

function setup() {
  canvas = createCanvas(600, 400);
  canvas.parent('canvas-container');
  background(255);
  if (typeof p5 === 'undefined') {
    console.error('p5.js not loaded. Check CDN or script inclusion.');
  }
}

function draw() {
  if (isDrawing) {
    let x = mouseX;
    let y = mouseY;
    // Apply slightly harder deflection near the end (last 20% of points, assuming ~100 points for a circle)
    if (points.length > 80) {
      x += 12; // Fixed +12 pixel deflection in x
      y += 12; // Fixed +12 pixel deflection in y
    }
    points.push(createVector(x, y));

    // Draw line segments as the user drags
    stroke(0);
    strokeWeight(2);
    if (points.length > 1) {
      line(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      );
    }
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    isDrawing = true;
    points = [];
    select('#score').html('Score: 0'); // Reset score display on new draw
  }
}

function mouseReleased() {
  if (isDrawing) {
    isDrawing = false;
    if (points.length > 20) { // Minimum points for a valid shape
      calculateScore();
    } else {
      select('#score').html('Score: 0 (Draw a larger shape!)');
    }
  }
}

function calculateScore() {
  // Calculate centroid
  let cx = 0, cy = 0;
  for (let p of points) {
    cx += p.x;
    cy += p.y;
  }
  cx /= points.length;
  cy /= points.length;

  // Calculate distances from centroid
  let distances = points.map(p => dist(cx, cy, p.x, p.y));
  let avgRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // Calculate variance to measure circularity
  let variance = distances.reduce((sum, d) => sum + Math.pow(d - avgRadius, 2), 0) / distances.length;

  // Adjusted scoring for better feedback
  score = Math.max(0, 100 - Math.sqrt(variance) * 3);
  score = Math.floor(score);

  // Debug logging
  console.log(`Points: ${points.length}, Avg Radius: ${avgRadius.toFixed(2)}, Variance: ${variance.toFixed(2)}, Score: ${score}`);

  // Update score display
  select('#score').html(`Score: ${score}`);

  // Draw final shape in blue
  stroke(0, 0, 255);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let p of points) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);
}

function clearCanvas() {
  background(255);
  score = 0;
  select('#score').html('Score: 0');
  points = [];
}

window.onload = function() {
  if (!window.p5) {
    console.error('p5.js library failed to load. Check network or CDN URL.');
  }
};