let points = [];
let isDrawing = false;
let score = 0;
let canvas;
let perfectCircleX;
let perfectCircleY;
let perfectCircleRadius;
let funnyTexts = [
  "Not even close! 😂",
  "Told you it was impossible for you. 😉",
  "Maybe try a square next time? 😜",
  "Your circle looks a bit... sleepy. 😴",
  "Did a cat walk across your mousepad? 🐾"
];

function setup() {
  // Use a responsive canvas size.
  // The min() function ensures it doesn't get too wide on large screens.
  let canvasWidth = min(windowWidth * 0.9, 600);
  let canvasHeight = min(windowHeight * 0.6, 400);

  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container');
  background(255); // Consistent white background

  if (typeof p5 === 'undefined') {
    console.error('p5.js not loaded. Check CDN or script inclusion.');
  }

  // Set the properties for the perfect circle based on the new, dynamic canvas size
  perfectCircleX = width / 2;
  perfectCircleY = height / 2;
  perfectCircleRadius = min(width, height) * 0.8;
}

function displayRandomText() {
  let randomIndex = floor(random(funnyTexts.length));
  let text = funnyTexts[randomIndex];
  select('#feedback').html(text);
}

function draw() {
  clear(); // Clear the canvas with a white background
  noStroke();
  fill(0, 100, 255, 80); // A slightly more opaque and brighter blue
  ellipse(perfectCircleX, perfectCircleY, perfectCircleRadius, perfectCircleRadius);

  // This part of the code is the drawing logic
  if (isDrawing) {
    let x = mouseX;
    let y = mouseY;

    // Apply the deflection logic
    if (points.length > 150) {
      x += 60;
      y += 10;
    }
    if (points.length > 300) {
      x -= 30;
      y -= 50;
    }
    points.push(createVector(x, y));

    // Redraw the entire path from the points array
    stroke(255);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let p of points) {
      vertex(p.x, p.y);
    }
    endShape();
  }

  // After drawing is complete, redraw the final shape
  if (!isDrawing && points.length > 20) {
    stroke(255, 0, 0);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let p of points) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
}

function mousePressed() {
  // Ensure touch events on mobile devices work correctly
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    isDrawing = true;
    points = [];
    select('#score').html('Score: 0'); // Reset score display on new draw
    select('#feedback').html(''); // Clear the funny text when a new drawing starts
  }
}

function mouseReleased() {
  if (isDrawing) {
    isDrawing = false;
    if (points.length > 20) { // Minimum points for a valid shape
      calculateScore();
      displayRandomText();
    } else {
      select('#score').html('Score: 0 (Draw a larger shape!)');
      select('#feedback').html('');
    }
  }
}

function calculateScore() {
  // --- All the existing calculation logic stays the same ---
  let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0, sumX3 = 0, sumY3 = 0, sumXy2 = 0, sumYx2 = 0;
  let N = points.length;

  for (let p of points) {
    let x = p.x;
    let y = p.y;
    sumX += x;
    sumY += y;
    sumX2 += x * x;
    sumY2 += y * y;
    sumXY += x * y;
    sumX3 += x * x * x;
    sumY3 += y * y * y;
    sumXy2 += x * y * y;
    sumYx2 += y * x * x;
  }

  let A = N * sumX2 - sumX * sumX;
  let B = N * sumXY - sumX * sumY;
  let C = N * sumY2 - sumY * sumY;
  let D = 0.5 * (N * sumX3 - sumX * sumX2 + N * sumXy2 - sumX * sumY2);
  let E = 0.5 * (N * sumY3 - sumY * sumY2 + N * sumYx2 - sumY * sumX2);

  let centerX, centerY;
  let denominator = A * C - B * B;
  if (Math.abs(denominator) < 1e-6) {
    centerX = sumX / N;
    centerY = sumY / N;
  } else {
    centerX = (D * C - B * E) / denominator;
    centerY = (A * E - B * D) / denominator;
  }

  let totalRadius = 0;
  for (let p of points) {
    totalRadius += dist(p.x, p.y, centerX, centerY);
  }
  let avgRadius = totalRadius / N;

  let totalDeviation = 0;
  for (let p of points) {
    totalDeviation += Math.abs(dist(p.x, p.y, centerX, centerY) - avgRadius);
  }
  let avgDeviation = totalDeviation / N;

  let score = 100 - avgDeviation * 4;

  let startPoint = points[0];
  let endPoint = points[points.length - 1];
  let closureDistance = dist(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

  let circumference = 2 * PI * avgRadius;
  if (circumference > 0) {
    let closurePenalty = (closureDistance / circumference) * 100;
    score -= closurePenalty * 0.5;
  }

  let pathLength = 0;
  for (let i = 1; i < points.length; i++) {
    pathLength += dist(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
  }

  let perfectPathLength = 2 * PI * avgRadius;
  let lengthDeviation = Math.abs(pathLength - perfectPathLength);

  if (perfectPathLength > 0) {
    let lengthPenalty = (lengthDeviation / perfectPathLength) * 100;
    score -= lengthPenalty * 0.1;
  }

  score = constrain(score, -100, 100);
  score = Math.floor(score);

  console.log(`Avg Deviation: ${avgDeviation.toFixed(2)}, Closure Distance: ${closureDistance.toFixed(2)}, Final Score: ${score}`);

  select('#score').html(`Score: ${score}`);

  // The condition is now changed to check for exactly 100
  if (score === 100) {
    // If the score is exactly 100, show the special message
    select('#feedback').html("Wait... you actually did it?! IMPOSSIBLE! 🤯 Congrats!");
  } else {
    // Otherwise, show one of the random funny texts
    displayRandomText();
  }

  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let p of points) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

  stroke(0, 255, 0);
  strokeWeight(1);
  ellipse(centerX, centerY, avgRadius * 2, avgRadius * 2);
}

function clearCanvas() {
  background(255); // Consistent white background
  score = 0;
  select('#score').html('Score: 0');
  points = [];
  select('#feedback').html(''); // Clears the funny text
}

window.onload = function() {
  if (!window.p5) {
    console.error('p5.js library failed to load. Check network or CDN URL.');
  }
};

// Add a function to handle window resizing to keep the canvas responsive
function windowResized() {
  let canvasWidth = min(windowWidth * 0.9, 600);
  let canvasHeight = min(windowHeight * 0.6, 400);
  resizeCanvas(canvasWidth, canvasHeight);

  // Recalculate the preview circle properties
  perfectCircleX = width / 2;
  perfectCircleY = height / 2;
  perfectCircleRadius = min(width, height) * 0.8;

  // Clear the canvas and reset the game state
  clearCanvas();
}
