//---------------------------------------------
// * CONES *
//---------------------------------------------

var doc = document;
var canvas = doc.querySelector('#canvas');
var ctx = canvas.getContext('2d');

var width = window.innerWidth;
var height = window.innerHeight;
canvas.width = width;
canvas.height = height;

//---------------------------------------------

var maxSectionsInput = doc.querySelector('.js-maxSections');
var maxWidthInput = doc.querySelector('.js-maxWidth');
var controls = doc.querySelector('.controls');
var randomBtn = doc.querySelector('.js-random');
var downloadBtn = doc.querySelector('.js-download');

//---------------------------------------------

var treeHeight = height * 1.5;
var maxSections = 5;
var minLineWidth = 1;
var maxLineWidth = 70;
var space = 300;

var sectionLength = 0;
var rowLength = 0;
var xOffset = 0;

var header = 'font-size: 16px; font-weight: bold; color: royalblue;';
var bred = 'font-weight: bold;color: crimson;';

calcVars();

//---------------------------------------------

function calcVars() {
  sectionLength = treeHeight / maxSections;
  rowLength = Math.round(width / (maxLineWidth + space));
  xOffset = width / (rowLength + 1) - maxLineWidth;
}

//---------------------------------------------

var colors = [
  'crimson',
  'tomato',
  'salmon',
  'orangered',
  'palegoldenrod',
  'khaki',
  'gold',
  'yellowgreen',
  'olive',
  'aquamarine',
  'mediumturquoise',
  'darkturquoise',
  'darkcyan',
  'skyblue',
  'cornflowerblue',
  'rebeccapurple',
  'purple',
  'darkviolet'
];

function getColorPos(prevColorPos) {
  var colorPos = Math.floor(Math.random() * colors.length);

  while (colorPos === prevColorPos) {
    colorPos = Math.floor(Math.random() * colors.length);
  }

  prevColorPos = colorPos;
  return colorPos;
}

//---------------------------------------------

function drawArc(params) {
  var x = params.x;
  var y = params.y;
  var r = params.r || sectionLength / 2;
  var lineWidth = params.lineWidth || 0;
  var color = params.color || 'green';
  var acc = params.odd || false;

  ctx.fillStyle = color;

  var startAngle = 0;
  var endAngle = (Math.PI/180) * 360;

  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.arc(x, y, r, startAngle, endAngle, acc);
  ctx.fill();
}

//---------------------------------------------

function Branch(params) {
  this.type = params.type;
  this.left = params.left;
  this.bottom = params.bottom;
  this.max = params.max;
  this.level = params.level;
  this.currentStep = 1;
  this.colorPos = null;
  // Branch angle
  this.angle = params.angle || 0;
  // Branch direction
  this.side = params.side || '';
  this.maxLineWidth = params.maxLineWidth || maxLineWidth;
  this.lineStep = Math.round((this.maxLineWidth - minLineWidth) / this.max * 100) / 100;
  this.halfLineStep = this.lineStep / 2;
  this.maxSectionLength = params.maxSectionLength || sectionLength;

  this.xOffset = this.maxLineWidth / 2;

  this.sectionStart = {
    left: this.left,
    bottom: this.bottom,
    width: this.maxLineWidth
  };
  this.sectionEnd = {};

  this.drawSection();
}

//---------------------------------------------

Branch.prototype.endPoint = function () {
  if (this.angle === 0){
    return {x: 0, y: 0};
  }
  var Arad = this.angle * Math.PI / 180;
  var a = Math.round(Math.sin(Arad) * this.sectionLength);
  var b = Math.round(Math.cos(Arad) * this.sectionLength);
  return {x: b, y: a};
};

//---------------------------------------------

Branch.prototype.copyEndToStart = function () {
  for(var key in this.sectionEnd) {
    var newKey = key === 'top' ? 'bottom' : key;
    this.sectionStart[newKey] = this.sectionEnd[key];
  }
};

//---------------------------------------------

Branch.prototype.drawSection = function() {

  var type = this.angle ? '/' : '|';
  if (this.side === 'left') {
    type = '\\';
  }

  this.colorPos = getColorPos(this.colorPos);
  this.color = colors[this.colorPos];
  ctx.fillStyle = this.color;

  // console.group('Step: ', this.currentStep, type);
  // console.log('%c' + this.color, 'background:' + this.color);
  // console.groupEnd();

  if ( this.sectionEnd.top ) {
    this.copyEndToStart();
  }

  this.sectionLength = rand(sectionLength/3,sectionLength);
  if (this.level === 0 ){
    this.sectionLength = rand(sectionLength/2,sectionLength * 1.5);
  }
  this.branchOffset = this.sectionLength / 2;

  var endCoords = this.endPoint();
  if (this.side === 'left') {
    endCoords.x = -endCoords.x;
  }

  this.sectionEnd.width = this.sectionStart.width - this.lineStep;
  if (this.sectionEnd.width < minLineWidth) {
    this.sectionEnd.width = minLineWidth;
  }

  this.sectionEnd.left = this.sectionStart.left + endCoords.x  + this.halfLineStep;
  this.sectionEnd.right = this.sectionEnd.left + this.sectionEnd.width;
  this.sectionEnd.top = this.sectionStart.bottom - this.sectionLength;

  if (this.angle) {
    this.sectionEnd.top = this.sectionStart.bottom - endCoords.y;
  }

  var d = [ 'M',
            this.sectionStart.left, this.sectionStart.bottom, // bottom left
            this.sectionStart.left + this.sectionStart.width, this.sectionStart.bottom, // bottom right
            this.sectionEnd.right, this.sectionEnd.top,  //top right
            this.sectionEnd.left, this.sectionEnd.top, // top left
            'Z'
          ].join(' ');

  var p = new Path2D(d);
  ctx.fill(p);

  // Add branches
  if (this.level < maxSections) {
    var angles = {
      left: rand(25,90),
      right: rand(25,90)
    };

    this.level++;

    var branch1 = new Branch({
      type: '/',
      left: this.sectionEnd.left,
      bottom: this.sectionEnd.top,
      maxLineWidth: this.sectionEnd.width,
      maxSectionLength: this.sectionLength,
      max: 2,
      angle: angles.left,
      side: 'left',
      level: this.level
    });

    var branch1 = new Branch({
      type: '/',
      left: this.sectionEnd.left,
      bottom: this.sectionEnd.top,
      maxLineWidth: this.sectionEnd.width,
      maxSectionLength: this.sectionLength,
      max: 2,
      angle: angles.right,
      side: 'right',
      level: this.level
    });
  }

  // Circles
  var circParams = {
    x: this.sectionEnd.right - this.sectionEnd.width/2,
    y: this.sectionEnd.top,
    r: this.sectionEnd.width * (5 * this.level)/10,
    color: this.color
  };
  drawArc(circParams);

  circParams.r = this.sectionEnd.width * (4 * this.level)/10;
  circParams.color = 'black';
  drawArc(circParams);

  circParams.r = this.sectionEnd.width * (3 * this.level)/10;
  this.colorPos = getColorPos(this.colorPos);
  circParams.color = colors[this.colorPos];
  drawArc(circParams);

  circParams.r = this.sectionEnd.width * (2 * this.level)/10;
  circParams.color = 'black';
  drawArc(circParams);

  circParams.r = this.sectionEnd.width * (1 * this.level)/10;
  this.colorPos = getColorPos(this.colorPos);
  circParams.color = colors[this.colorPos];
  drawArc(circParams);
};

//---------------------------------------------

function drawCones() {
  for (var i = 0; i < rowLength; i++) {
    var left = i * (maxLineWidth + xOffset) + xOffset;

    var branch = new Branch({
      left: left,
      bottom: height,
      max: maxSections,
      maxSectionLength: sectionLength,
      level: 0
    });
  }
}

//---------------------------------------------

function rand(min, max) {
  return Math.round(Math.random() *(max - min) + min);
}

function randomizeVals() {
  maxSections = rand(maxSectionsInput.min, maxSectionsInput.max);
  maxSectionsInput.value = maxSections;

  maxLineWidth = rand(maxWidthInput.min, maxWidthInput.max);
  maxWidthInput.value = maxLineWidth;

  calcVars();
  drawCones();
}

//---------------------------------------------

function maxSectionsChange() {
  maxSections = +this.value;
  calcVars();
  drawCones();
}

function maxWidthChange() {
  maxLineWidth = +this.value;
  calcVars();
  drawCones();
}

//---------------------------------------------

function download() {
  var dataUrl = canvas.toDataURL();
  downloadBtn.href = dataUrl;
}

//---------------------------------------------

drawCones();

maxSectionsInput.addEventListener('input', maxSectionsChange);
maxWidthInput.addEventListener('input', maxWidthChange);

randomBtn.addEventListener('click', randomizeVals);
downloadBtn.addEventListener('click', download);
