'use strict';

const THREE     = require('three');
const bind      = require('../../misc/bind');
const Feature   = require('./feature');

module.exports = (function() {

  function Solid(voxel, vertices) {
    bind(this);
    Feature.call(this, voxel, vertices);
  }

  Solid.prototype = Object.create(Feature.prototype);

  Solid.prototype.positionMatrix = function(thickness) {
    thickness = thickness || 0;
    const edgeLength = thickness + 1.0;
    return new THREE.Matrix4()
      .scale(new THREE.Vector3(edgeLength, edgeLength, edgeLength))
      .setPosition(this.center);
  }

  Solid.prototype.offsetMatrix = function() {
    return new THREE.Matrix4();
  }

  Solid.prototype.localEdges = function() {
    return [
      [6, 2], [2, 3], [3, 7], [7, 6], [6, 3], // top
      [4, 0], [0, 1], [1, 5], [5, 4], [4, 1], // bottom
      [6, 4], [4, 7], [7, 5], [5, 3], [3, 1], [1, 2], [2, 0], [0, 6] // sides
    ];
  }

  return Solid;

})();