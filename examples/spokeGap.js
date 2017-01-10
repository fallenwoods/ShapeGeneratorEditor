
// make the patterns for the gaps between spokes on a wheel
// spoke thickness is approximately the same as innerR
var PI = Math.PI;
var cos = Math.cos;
var sin = Math.sin;
var abs = Math.abs;
var atan2 = Math.atan2;
var min = Math.min;
var max = Math.max;


var spokeThickness = 2;
// this creates a single gap. It should be copied and transformed by 2*PI/spokeCount spokeCount times
function spokeGap(hubR, outerR, spokeCount){
	var result=[];
	var st = spokeThickness;
	var shape =  new Core.Path2D(); //THREE.Shape();		// fixme - replace THREE with svg code
	
	var angle = PI/spokeCount;		// actually half angle	
	var innerR = max(st+hubR,(st)/angle);
	outerR -= st;
	
	if((outerR - innerR)<st) return null;	//degenerate case - either the hub is too big for gaps or there are too many spokes for this diameter
	
	var innerOffsetAngle = (st/2)/innerR;
	var outerOffsetAngle = (st/2)/outerR;
	
	// Base corner [left,center,right]
	var basePts = [[0,st/2],[0,0],[st/2,0]];
	
	// define corners. Each is [left,center,right]
	var c1 = translate(rotate(basePts,-angle),innerR*cos(-angle+innerOffsetAngle),innerR*sin(-angle+innerOffsetAngle));	// tilt to the angle of the spoke, and roate the corner to the inner edge of the spoke
	var c2 = translate(rotate(basePts,-angle+PI/2),outerR*cos(-angle+outerOffsetAngle),outerR*sin(-angle+outerOffsetAngle));	
	var c3 = translate(rotate(basePts,angle+PI),outerR*cos(angle-outerOffsetAngle),outerR*sin(angle-outerOffsetAngle));	
	var c4 = translate(rotate(basePts,angle+3*PI/2),innerR*cos(angle-innerOffsetAngle),innerR*sin(angle-innerOffsetAngle));	
	
	//result = result.concat(basePts);
	//result = result.concat(c1,c2,c3,c4)
	//*
	var outerArcPts = arc ( shape, 0, 0, (outerR), -(angle-(2*outerOffsetAngle)), (angle-(2*outerOffsetAngle)), true )
	var innerArcPts = arc ( shape, 0, 0, (innerR), (angle-(2*innerOffsetAngle)), -(angle-(2*innerOffsetAngle)), true )
	
	shape.moveTo(innerArcPts[innerArcPts.length-1][0],innerArcPts[innerArcPts.length-1][1]);
	shape.quadraticCurveTo(c1[1][0],c1[1][1],c1[2][0],c1[2][1]);
	shape.lineTo(c2[0][0],c2[0][1]);
	shape.quadraticCurveTo(c2[1][0],c2[1][1],outerArcPts[0][0],outerArcPts[0][1]);
	//shape.absarc ( 0, 0, (outerR), (angle-(2*outerOffsetAngle)), -(angle-(2*outerOffsetAngle)), true )	
	pointsToShape(shape,outerArcPts);
	shape.quadraticCurveTo(c3[1][0],c3[1][1],c3[2][0],c3[2][1]);
	shape.lineTo(c4[0][0],c4[0][1]);	
	shape.quadraticCurveTo(c4[1][0],c4[1][1],innerArcPts[0][0],innerArcPts[0][1])
	pointsToShape(shape,innerArcPts);
	//shape.lineTo(c1[0][0],c1[0][1]);
	
	
	//var v2dpts = shape.extractPoints().shape;

	//*/
	
	return shape.toPolygons();
	
}
function rotate(points,r){
	var result = [];
	for(var i = 0 ; i<points.length;i++){
		result.push([
			points[i][0] * cos(r) - points[i][1] * sin(r) ,
			points[i][0] * sin(r) + points[i][1] * cos(r)
		]);
	}
	return result;
}
function translate(points,x,y){
	var result = [];
	for(var i = 0 ; i<points.length;i++){
		result.push([points[i][0]+x,points[i][1]+y]);
	}
	return result;
}
function arc ( shape, cx, cy, r, sAng, eAng){
	var result = [];
	var deltaA = (eAng - sAng)/20;
	
	for(var i = 0; i <= 20; i++){
		var a = sAng + i*deltaA;
		result.push([r*cos(a)+cx,r*sin(a)+cx]);
	}
	
	return result;
}
function pointsToShape(shape,points){
	shape.moveTo(points[0][0],points[0][1]);
	for (var i = 0; i < points.length;i++){
		shape.lineTo(points[i][0],points[i][1]);
	}
}
