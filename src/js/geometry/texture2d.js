'use strict';

const $ = require('jquery');
const _ = require('lodash');
const bind = require('../misc/bind');

const createjs = require('createjs-browserify');

module.exports = (function() {

  function Texture2d() {}

  Texture2d.getImage = function(pattern) {
    var width = 80;
    var height = 40;
    var canvas = document.createElement("canvas");
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
  //  canvas.setAttribute('class', "canvas-pattern");

    var stage = new createjs.Stage(canvas);
    var bg = new createjs.Shape();
    bg.graphics.beginFill("white").drawRect(0, 0, width, height);
    var line = new createjs.Shape();
    line.graphics.setStrokeStyle(2).beginStroke("rgba(0,0,0,0.5)");
    line.graphics.moveTo(0, 0);
    line.graphics.lineTo(width, height);
    stage.addChild(bg);
    stage.addChild(line);
    var text = new createjs.Text(pattern, "16px Arial", "#0077ff");
    text.x = 5;
    text.y = height/2;
    text.textBaseline = "alphabetic";
    stage.addChild(text);
    stage.update();
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return image;
  }

  return Texture2d;

})();
