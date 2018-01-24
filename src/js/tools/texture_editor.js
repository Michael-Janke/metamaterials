'use strict';

const $ = require('jquery');
require('jquery-ui-browserify');
const _ = require('lodash');
const THREE = require('three');
const createjs = require('createjs-browserify');
const bind = require('../misc/bind');

const TextureCanvasDrawer = require('./texture_canvasdrawer');
const Texture2d = require('../geometry/textureCell/texture2d');
const TextureRegular = require('../geometry/textureCell/textureRegular');
const TextureRound = require('../geometry/textureCell/textureRound');
const TextureBox = require('../geometry/textureCell/textureBox');
const TextureZigZag = require('../geometry/textureCell/textureZigZag');
const TextureCustom = require('../geometry/textureCell/textureCustom');


const patterns = ['regular', 'round', 'box', 'zigzag']; //'diamond', 'spiky', 'custom', 'debug'];

const mapping = {'regular' : TextureRegular, 'round': TextureRound, 'box': TextureBox, 'zigzag': TextureZigZag};

module.exports = (function() {

  function getButtonDom(image) {
    return $('<div></div>')
      //.attr({ id: brush.hash })
      .addClass('voxel-btn voxel-cells-btn')
      .append($('<div></div>')
        .addClass('voxel-btn-img')
        .css({
          width: 60
        })
        .append($('<div></div>')
          .addClass('voxel-btn-selection')
        )
        .append(image));
  }

  function TextureEditor(tools) {
    bind(this);
    this.tools = tools;
    this.brushes = {};
    this.rotatation = $('#texture_rotate').checked;
    var self = this;
    var container = $('#texture-presets');
    patterns.forEach(function(pattern) {
      //generate UI element
      var width = 80;
      var height = 60;
      var canvas = document.createElement("canvas");
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      var image = Texture2d.getImageFromCoordsArray(mapping[pattern].getDrawing());
      var domElement = getButtonDom(image);

      domElement.click(function() {
        self.activateBrush(pattern);
      });

      container.append(domElement);
      self.brushes[pattern] = {
        name: pattern,
        domElement: domElement,
        type: "texture"
      };
    });
    $('#texture_rotate').click(function() {
      self.rotatation = this.checked;
      self.activateBrush(); //reactivate brush with new parameter
    });

    //
    let div = $('<div></div>');
    $('#canvas-container').append(div);
    let canvas = $('<canvas height=100 width=200 class="texture-canvas"></canvas>');
    div.draggable({
      disabled: false,
      axis: 'y',
      //prevent dragging when clicked on line or dot
      drag: function(event, ui) {
        return !self.canvasdrawer.movingDot;
      }
    });
    div.append(canvas);
    let addcellDom = $('<div><button type="button" class="btn btn-secondary" style="width: 100%"">extend cell</button></div>');
    addcellDom.click(function(event) {
      self.canvasdrawer.addCell();
      self.canvasdrawer.cellCount == 1 ? $('#remove-cell').hide() : $('#remove-cell').show();
    });
    div.append(addcellDom);
    let removecellDom = $('<div><button type="button" id="remove-cell" class="btn btn-secondary" style="width: 100%"">reduce cell</button></div>');
    removecellDom.click(function(event) {
      self.canvasdrawer.removeCell();
      //move everything down
      let offsetTop = Number(self.container[0].style.top.replace("px", ""));
      self.container[0].style.top = offsetTop + self.canvasdrawer.cellHeight + "px";
      //hide reduce button
      self.canvasdrawer.cellCount == 1 ? $(event.target).hide() : $(event.target).show();
    });
    removecellDom.hide(); //because cellCount==1
    div.append(removecellDom);
    this.canvasdrawer = new TextureCanvasDrawer(canvas);
    this.container = div;

    div.click(function(event) {
      let image = self.canvasdrawer.getImage();
      let cc = Math.random().toString(36).substring(7);
      let pattern = "custom" + cc;
      var domElement = getButtonDom(image);
      var customPath = self.canvasdrawer.getDrawing();
      domElement.click(function() {
        self.activateBrush(pattern, customPath);
      });

      container.append(domElement);
      self.brushes[pattern] = {
        name: pattern,
        domElement: domElement,
        type: "texture"
      };

      self.activateBrush(pattern);
    });

    //this.canvasdrawer = new TextureCanvasDrawer($('#canvas-container'));
    // onchange: update --> generate image, name, add to brushes, generate dom element and activateBrush


  }


  TextureEditor.prototype.activateBrush = function(name, customPath) {

    $('.voxel-cells-btn').removeClass('active');

    let texture;
    if (name.startsWith("custom") &&  this.activeBrush.name != name) {
      texture = TextureCustom;
      texture.getDrawing = () => customPath || this.canvasdrawer.getDrawing();
    } else {
    texture = mapping[name];
    }

    if ((this.activeBrush == undefined || this.activeBrush.name != name) && texture && texture.getIsCustomizable()) {
      this.canvasdrawer.load(texture.getDrawing());
      //this.canvasdrawer.setCellCount(2);
      $("#canvas-container").show();
    }
    if (texture && !texture.getIsCustomizable()) {
      this.canvasdrawer.block();
      $("#canvas-container").hide();
    }
    if (texture && this.activeBrush && this.activeBrush.name.startsWith('custom')) {
      console.log("remove unused brush", this.activeBrush.name);
      this.removeUnusedBrush();
    }
    var brush = this.brushes[name];
    brush.name = name;
    brush.hash = name;
    brush.rotated = this.rotatation;
    brush.canvasdrawer = this.canvasdrawer;
    brush.domElement.addClass('active');
    brush.texture = texture;
    this.activeBrush = brush;
    this.tools.forEach(function(tool) {
      tool.activeBrush = brush;
      //tool.rotatedMode = brush.rotated;
    });

    //this.update();
  }

  TextureEditor.prototype.removeUnusedBrush = function() {
    if (this.activeBrush && !this.activeBrush.used) {
      this.activeBrush.domElement.remove();
      delete this.brushes[this.activeBrush.hash];
    }
  }



  return TextureEditor;

})();
