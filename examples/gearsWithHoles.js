// -------------------------------------------
// Added Automatically During Library Upgrade.
// Convenience Declarations For Dependencies.
// 'Core' Is Configured In Libraries Section.
// -------------------------------------------
//var Debug = Core.Debug;
var Mesh3D = Core.Mesh3D;
var Path2D = Core.Path2D;
//var Plugin = Core.Plugin;
var Tess = Core.Tess;
var Solid = Core.Solid;

var PI = Math.PI;
var cos = Math.cos;
var sin = Math.sin;
var abs = Math.abs;
var sqrt = Math.sqrt;
var atan2 = Math.atan2;

// -------------------------------------------
// Original Shape Script:
// -------------------------------------------
params = [
	{ 	"id"			: "module", 
		"displayName"	: "Module (tooth width)",
	 	"type"			: "float",
	 	"rangeMin"		: 0,
	 	"rangeMax"		: 10,
	 	"default"		: 1.0,
		"steps"			: 0.1
	},
	
	{ 	"id"			: "nTeeth",
	 	"displayName"	: "Number of teeth",
	 	"type"			: "int",
	 	"rangeMin"		: 3,
	 	"rangeMax"		: 200,
	 	"default"		: 20
	},
	{ 	"id"			: "pitchAngle",
	 	"displayName"	: "Pitch angle",
	 	"type"			: "angle",
	 	"rangeMin"		: 0,
	 	"rangeMax"		: 30,
	 	"default"		: 20
	},
	{ 	"id"			: "spokeCount",
	 	"displayName"	: "Spokes",
	 	"type"			: "int",
	 	"rangeMin"		: 3,
	 	"rangeMax"		: 24,
	 	"default"		: 3
	},
	{ 	"id"			: "height",
	 	"displayName"	: "Height",
	 	"type"			: "float",
	 	"rangeMin"		: 1,
	 	"rangeMax"		: 20,
	 	"default"		: 4
	},
	{ 	"id"			: "axle",
	 	"displayName"	: "Axle Radius",
	 	"type"			: "float",
	 	"rangeMin"		: 0,
	 	"rangeMax"		: 20,
	 	"default"		: 1
	}
]

function process(params) {
	var module = params["module"];
	var nTeeth = params["nTeeth"];
	var pitchA = params["pitchAngle"];
	var spokeCount = params["spokeCount"];
	var height = params["height"];
	var axle = params["axle"];

	if( module < 0.1 )
		module = 0.1;
	
	var nominalD = nTeeth * module;
	var innerR = nominalD / 2 - module;
	var outerR = nominalD / 2 + module;

	var px = innerR;
	var py = 0;

	var inv = involute(nTeeth, module, pitchA);
	
	var path = new Path2D();
	
	for (var i = 0; i < nTeeth; i++)
	{
		var a = (i + 0.25) * PI * 2 / nTeeth;

		for( var j = 0; j < inv.length; j++ )
		{
			var ang = a + inv[j][0];
			var rad = inv[j][1];

			var x = cos(ang) * rad;
			var y = sin(ang) * rad;
			
			if(i == 0 && j==0) path.moveTo( x, y );
			
			path.lineTo( x, y );
		}

		a = (i + 0.75) * PI * 2 / nTeeth;

		for( var j = inv.length - 1; j >= 0; j-- )
		{
			var ang = a - inv[j][0];
			var rad = inv[j][1];

			var x = cos(ang) * rad;
			var y = sin(ang) * rad;
			
			path.lineTo( x, y );
		}
	}
	path.close();
	
	var paths = [];
	paths.push(path);
	
	for(var sp = 0; sp < spokeCount; sp++){
		var gap = spokeGap(axle, innerR, spokeCount, 2);
		if(!gap) break;
		gap = rotate(gap,sp*(2*PI/spokeCount));
		var hole = new Path2D()
		hole.moveTo(gap[gap.length-1][0],gap[gap.length-1][1]);
		for (var i = gap.length-1; i>=0 ;i--){
			hole.lineTo(gap[i][0],gap[i][1]);
		}
		hole.close();
		paths.push(hole);
		//break;
	}
	
	var axlePath = new Path2D()
	axlePath.moveTo(axle,0);
	for(var i =0; i < 20; i++){
		axlePath.lineTo(axle*cos(-i*2*PI/20),axle*sin(-i*2*PI/20));
	}
	paths.push(axlePath);
	


	var solid = Solid.extrude(paths, height);
	return solid;
}

// see http://www.arc.id.au/GearDrawing.html
// for approximating the involute with a bezier.

// returns an array of angle, radius for one edge of a tooth.
//(this incorporates an involute curve.)
function involute( nTeeth, module, pitchAngle )
{
	// all dimensions assume millimeters.
	
	if( module < 0.1 )
		module = 0.1;
	
	// whole height (depth) of teeth.
	var H = module < 1.25 ? module * 2.4 : module * 2.25;

	var A = module;	// addendum, height above pcd
	var D = H - A;	// dedendum, height below pcd
	
	var pcd = nTeeth * module;
	var outerR = pcd / 2 + A;
	var innerR = pcd / 2 - D;

	var invR = pcd * cos(pitchAngle * PI / 180) / 2;
	
	pts = [];

	pts.push( [0, innerR] );

	for( a = 0; ; a += 0.5 )
	{
		ang = a * PI / 180;

		vx = cos(ang);
		vy = sin(ang);
		
		dist = ang * invR;

		x = vx * invR + vy * dist;
		y = vy * invR - vx * dist;

		r = sqrt(x * x + y * y);

		if( r < innerR )
			; // ignore
		else if( r < outerR )
			pts.push( [atan2(y, x), r] );
		else
		{
			pts.push( [atan2(y, x), outerR] );
			break;
		}
	}
	
	// find index closest to pitch radius, and
	// then offset all the angles.
	var pitchR = (outerR + innerR) / 2;

	var bestAng	 = 0;
	var bestDist = module;

	for( i = 1; i < pts.length; i++ )
	{
		var dist = abs(pitchR - pts[i][1]);
		if( bestDist > dist )
		{
			bestDist = dist;
			bestAng  = pts[i][0];
		}
	}
	
	for( i = 0; i < pts.length; i++ )
	{
		pts[i][0] -= bestAng;
	}
	
	return pts;
}
// -------------------------------------------
// Added Automatically During Library Upgrade.
// Original Shape Color. Changing Effects The
// Default Color In All Documents Where Used.
// -------------------------------------------
presets = [
	{ 'color': [169, 123, 80] }
];


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
