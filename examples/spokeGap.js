
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
	shape.moveTo(c1[0][0],c1[0][1]);
	shape.quadraticCurveTo(c1[1][0],c1[1][1],c1[2][0],c1[2][1]);
	shape.lineTo(c2[0][0],c2[0][1]);
	shape.quadraticCurveTo(c2[1][0],c2[1][1],c2[2][0],c2[2][1]);
	//shape.absarc ( 0, 0, (outerR), (angle-(2*outerOffsetAngle)), -(angle-(2*outerOffsetAngle)), true )	
	arc ( shape, 0, 0, (outerR), -(angle-(2*outerOffsetAngle)), (angle-(2*outerOffsetAngle)), true )
	shape.quadraticCurveTo(c3[1][0],c3[1][1],c3[2][0],c3[2][1]);
	shape.lineTo(c4[0][0],c4[0][1]);	
	shape.quadraticCurveTo(c4[1][0],c4[1][1],c4[2][0],c4[2][1])
	arc ( shape, 0, 0, (innerR), (angle-(2*innerOffsetAngle)), -(angle-(2*innerOffsetAngle)), true )
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
	var deltaA = (eAng - sAng)/20;
	
	shape.moveTo(r*cos(sAng)+cx,r*sin(sAng)+cy);
	for(var i = 0; i <= 20; i++){
		var a = sAng + i*deltaA;
		shape.lineTo(r*cos(a)+cx,r*sin(a)+cx);
	}
	
	return shape;
}
/*
function makeArc3pt(centerPt,startPt, endPt, r){
	var startA = atan2(startPt[1]-centerPt[1],startPt[0]-centerPt[0]);
	var endA = atan2(endPt[1]-centerPt[1],endPt[0]-centerPt[0]);
	
	// make up an interest filletThickness
	var filletThickness = 
		min(
			distance(centerPt,startPt),
			distance(centerPt,endPt)
			) * 0.5;
	

	return makeArc(centerPt, startA, endA, r, filletThickness);
}
function makeArc(center, startA, endA, r, filletThickness){
	
	var result = [];

	
	var deltaA = (endA - startA);
	var centerA = startA + deltaA/2;
	var filletThickness = spokeThickness * abs(deltaA/(2*PI));
	r = r || sin(deltaA/2)/(1-sin(deltaA/2))*filletThickness;
	var arcCenterDistance =  r/sin((endA-startA)/2);

	var startA = startA + PI + PI/2;		// rotate around origin 180 degrees and use the angle opposite
	var endA = endA + PI - PI/2;
	//while(startA>endA) { endA += (2*PI);}

	var arcCenter = [arcCenterDistance*cos(centerA),arcCenterDistance*sin(centerA)]
	
	//var arcCenter = [0,0]
	console.log(arcCenterDistance+','+arcCenter);
	
	var steps = r <= 4 ? 12 : floor(PI*r);		// get a reasonable number of line segments for a full circle
	steps = floor(abs(steps * (endA-startA)/(PI*2)));	// adjust for the actual angle
	var stepA = (endA-startA)/steps;
	//result.push(center);
	for(var i = 0; i<= steps; i++){
		result.push ([cos(i*stepA+startA)*r+arcCenter[0]+center[0],sin(i*stepA+startA)*r+arcCenter[1]+center[1]])
	}
	//result.push(center);
	
	return result;
}
function makeSimpleArc(center, startA, endA, r){
	
	var result = [];
	
	//var steps = r <= 4 ? 12 : floor(PI*r);		// get a reasonable number of line segments for a full circle
	var steps = floor(abs(3*r * (endA-startA)/(PI*2)));	// adjust for the fraction of the angle
	steps = steps > 5 ? steps : 5;
	var stepA = (endA-startA)/steps;
	
	for(var i = 0; i<= steps; i++){	
		result.push ([cos(i*stepA+startA)*r+center[0],sin(i*stepA+startA)*r+center[1]])
	}

	
	return result;
}



function distance(pt1,pt2){
	return sqrt((pt1[0]-pt2[0])*(pt1[0]-pt2[0]) + (pt1[1]-pt2[1])*(pt1[1]-pt2[1]));
}
function makeArcTest(steps,r,center){
	center = center || [0,0];
	var result = [];
	//var steps = 10;
	var deltaA = 2*PI/(2*steps);
	for(var i = 0 ; i < steps; i++){
		var A1 = 2*PI/steps * i;
		var A2 = A1 + deltaA;
		result = result.concat(makeArc(center, A1, A2, r));
	}
	return result;
}

function makeArc3ptTest(steps,w,center){
	center =  center || [0,0];
	var result = [];
	//var steps = 10;

	for(var i = 1 ; i < steps; i++){
		var startPt = [w+center[0],-w*i+center[1]];
		var endPt = [-w+center[0],-w*i+center[1]];
		result = result.concat(makeArc3pt(center, startPt, endPt, 10)); //(centerPt,startPt, endPt,r){
	}
	return result;
}
function makeArc3ptTest2(steps,r,center){
	center =  center || [0,0];
	var result = [];
	var points = []
	for(var i = 0 ; i < steps; i++){
		points.push([r*cos(2*PI/steps*i)+center[0],r*sin(2*PI/steps*i)+center[1]]);
	}
	for(var i = 1 ; i < steps-1; i++){
		result = result.concat(makeArc3pt(points[i-1],points[i],points[i+1], 10));
	}

	return result;
}
function combinedTest(){
	var result = [];
	result = result.concat(makeArc([0,0], PI/4, 3*PI/4, 30));
	result = result.concat(makeArc3pt([0,0], [1,1], [-1,1], 50));
	
	//result = result.concat(makeArc([100,100], PI/4, 3*PI/4, 30));
	//result = result.concat(makeArc3pt([100,100], [101,101], [99,101], 50));
	
	result = result.concat(makeArc3pt([100,100], [200,100], [100,200], 25));	
	result = result.concat(makeArc3pt([200,100], [100,200], [100,100], 10));	
	result = result.concat(makeArc3pt([100,200], [100,100], [200,100], 10));

	return result;
}
*/