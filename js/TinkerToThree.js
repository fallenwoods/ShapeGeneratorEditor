
// Three.js must be included in the parent page

var Core = {}

THREE.Vector2.prototype.applyMatrix4 = function(m){
	var vec3 = new THREE.Vector3(this.x,this.y,0).applyMatrix4(m);
	this.x = vec3.x;this.y = vec3.y;
}
THREE.LineCurve.prototype.applyMatrix4 = function(m){
	this.v1.applyMatrix4(m);
	this.v2.applyMatrix4(m);
}
THREE.QuadraticBezierCurve.prototype.applyMatrix4 = function(m){
	this.v0.applyMatrix4(m);
	this.v1.applyMatrix4(m);
	this.v2.applyMatrix4(m);
}
THREE.CubicBezierCurve.prototype.applyMatrix4 = function(m){
	this.v0.applyMatrix4(m);
	this.v1.applyMatrix4(m);
	this.v2.applyMatrix4(m);
	this.v3.applyMatrix4(m);
}
THREE.EllipseCurve.prototype.applyMatrix4 = function(m){
	
	var rotMat = matrix.transform.extractRotation();
	var angle = Math.asin(rotMat[1][2]);		// fixme - check this
		
	this.aX.applyMatrix4(m);
	this.aY.applyMatrix4(m);
	this.aRotation += angle;
	
	var v1 = new Vector3();
	var scaleX = 1 / v1.setFromMatrixColumn( m, 0 ).length();
	var scaleY = 1 / v1.setFromMatrixColumn( m, 1 ).length();
	
	this.xRadius *= scaleX;
	this.yRadius *= scaleY;

}
THREE.Path.prototype.applyMatrix4 = function(m){
	for(var i = 0 ; i < this.curves.length;i++){
		this.curves[i].applyMatrix4(m);
	}
}
THREE.Shape.prototype.applyMatrix4 = function(m){
	for(var i = 0 ; i < this.curves.length;i++){
		this.curves[i].applyMatrix4(m);
	}
	for(var i = 0 ; i < this.holes.length;i++){
		this.holes[i].applyMatrix4(m);
	}
}

Core.processParams = function(paramObjs){
	var result = [];
	
	for(var i = 0; i < paramObjs.length;i++){
		paramObjs[i].index = i;
		result[paramObjs[i].id] = paramObjs[i].default || paramObjs[i].rangeMin;
	}
	return result;
}

Core.Tess = function (){
}
Core.Tess.prototype = {
}
Core.Tess.circleDivisions = function (r){
		return r > 4 ? Math.floor(Math.PI*2*r)/2 : 12;
}

Core.Solid = function (){
}
Core.Solid.prototype = {
}
Core.Solid.make = function (mesh3d){
		mesh3d.geometry.computeBoundingBox();
		mesh3d.geometry.computeFaceNormals();
		mesh3d.geometry.rotateX(-Math.PI/2);	// three.js defaults to Y as up, tinkercad uses Z
		return mesh3d.geometry;
}
Core.Solid.extrude = function (path2dAry,height){
		var geo;
		
		var extrudeSettings = {
			//steps: 2,
			amount: height,
			bevelEnabled: false
		};
		//var shapes = [];
		//for(var i = 0; i < path2dAry.length; i++){
		//	shapes.push(path2dAry[i].path);
		//}
		var shape = path2dAry[0].path
		for(var i = 1;i<path2dAry.length;i++){
			shape.holes.push(path2dAry[i].path);
		}
		var geo = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		geo.computeBoundingBox();
		geo.computeFaceNormals();
		geo.rotateX(-Math.PI/2);	// three.js defaults to Y as up, tinkercad uses Z
		return geo;
}

Core.Mesh3D = function(){
	this.geometry = new THREE.Geometry();

}
Core.Mesh3D.prototype = {
	triangle:function(pt1,pt2,pt3){
		var first = this.geometry.vertices.length;
			
		this.geometry.vertices.push(
			new THREE.Vector3( pt1[0],pt1[1],pt1[2] ),
			new THREE.Vector3( pt2[0],pt2[1],pt2[2] ),
			new THREE.Vector3( pt3[0],pt3[1],pt3[2] )
		);

		this.geometry.faces.push( new THREE.Face3( first, first+1,first+2 ) );
		return this;		//chainable
	},
	computeExtras:function(){
		this.geometry.computeBoundingBox();
		this.geometry.computeFaceNormals();
	}
}

Core.Path2D = function (){
	this.path = new THREE.Shape();		// Shape is a Path subclass that is compatible with the Extruder class
	this.latestMove = [0,0];

}
Core.Path2D.prototype = {
	moveTo:function(x,y){
		this.latestMove = [x,y];
		this.path.moveTo(x,y);
		return this;
	},
	lineTo:function(x,y){
		this.path.lineTo(x,y);
		return this;
	},
	close:function(){
		this.path.lineTo(this.latestMove[0],this.latestMove[1]);
		return this;
	},
	quadraticCurveTo:function(cpx, cpy, x,y){
		this.path.quadraticCurveTo(cpx, cpy, x,y);
		return this;
	},
	bezierCurveTo:function(cp1x, cp1y, cp2x, cp2y, x,y){
		this.path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x,y);
		return this;
	},
	transform:function(m2d){
		this.path.applyMatrix4(m2d.transform)

		return this;
	},
	toPolygons:function(){
		var shapePts = [];
		var extracted = this.path.extractPoints();
		shapePts.push(extracted.shape);
		
		shapePts = shapePts.concat(extracted.holes)[0];
		
		var result=[];
		for(var i = 0; i < shapePts.length;i++){
			result.push([shapePts[i].x,shapePts[i].y]);
		}
		return result;

	}

}
Core.Matrix2D = function (){
	this.transform = new Matrix4();		// Shape is a Path subclass that is compatible with the Extruder class

}
Core.Matrix2D.prototype = {
	rotation:function(a){this.transform.makeRotationZ(a); return this;},
	translation:function(x,y){this.transform.makeTranslation(x,y,0); return this;},
	scaling:function(x,y){this.transform.makeScale(x,y,1); return this;},
	identity:function(){ this.transform = new Matrix4(); return this;},
	transform:function(matrix){this.transform.multiply(matrix);return this;}
}

//export Core;