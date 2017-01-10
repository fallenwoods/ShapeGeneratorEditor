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

// -------------------------------------------
// Original Shape Script:
// -------------------------------------------
params = [
	{ 	"id"			: "module", 
		"displayName"	: "Module",
	 	"type"			: "float",
	 	"rangeMin"		: 3,
	 	"rangeMax"		: 10,
	 	"default"		: 4.0
	},
	
	{ 	"id"			: "nTeeth",
	 	"displayName"	: "Number of teeth",
	 	"type"			: "int",
	 	"rangeMin"		: 3,
	 	"rangeMax"		: 200,
	 	"default"		: 18
	},
	
	{ 	"id"			: "pitchAngle",
	 	"displayName"	: "Pitch angle",
	 	"type"			: "angle",
	 	"rangeMin"		: 0,
	 	"rangeMax"		: 30,
	 	"default"		: 20
	}
]


/* Notes:
	if the hole is anti-clockwise, both clockwise and anti-clockwise shapes show the hole
	if the hole is clockwise, only the anti-clockwise shape show the hole
	.e.g. if both the shape and hole are drawn clockwise, the hole does not show
*/
function process(params) {

	var paths=[];
	var path = new Path2D();
	
	var side = 50;
	//*
	path.moveTo(side,0);		//Clockwise
	path.lineTo(0,-side);
	path.lineTo(-side,0);
	path.lineTo(0,side);
	path.lineTo(side,0);
	//*/
	/*
	path.moveTo(side,0);		//Anti-clockwise
	path.lineTo(0,side);
	path.lineTo(-side,0);
	path.lineTo(0,-side);
	path.lineTo(side,0);
	//*/
	
	paths.push(path);
	
	var path = new Path2D();
	var side = 25;
	/*
	path.moveTo(side,0);		//Clockwise
	path.lineTo(0,-side);
	path.lineTo(-side,0);
	path.lineTo(0,side);
	path.lineTo(side,0);
	//*/
	//*
	path.moveTo(side,0);		//Anti-clockwise
	path.lineTo(0,side);
	path.lineTo(-side,0);
	path.lineTo(0,-side);
	path.lineTo(side,0);
	//*/
	paths.push(path);

	var solid = Solid.extrude(paths, 20.0);
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

	var invR = pcd * Math.cos(pitchAngle * Math.PI / 180) / 2;
	
	pts = [];

	pts.push( [0, innerR] );

	for( a = 0; ; a += 0.5 )
	{
		ang = a * Math.PI / 180;

		vx = Math.cos(ang);
		vy = Math.sin(ang);
		
		dist = ang * invR;

		x = vx * invR + vy * dist;
		y = vy * invR - vx * dist;

		r = Math.sqrt(x * x + y * y);

		if( r < innerR )
			; // ignore
		else if( r < outerR )
			pts.push( [Math.atan2(y, x), r] );
		else
		{
			pts.push( [Math.atan2(y, x), outerR] );
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
		var dist = Math.abs(pitchR - pts[i][1]);
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

// this creates a single gap. It should be copied and transformed by 2*PI/spokeCount spokeCount times
function spokeGap(innerR, outerR, spokeCount){
	var result = [];
	if(outerR < innerR) return [];
	
	var filletR = innerR;	// as good as any
	var spokeCount = spokeCount ? spokeCount >= 3 ? spokeCount : 3 : 3;	// minimum of 3 spokes
	var angle = 2*Math.PI/spokeCount;
	
	var hub = makeArc([0,0],innerR,0,2*Math.PI);	
	// create fillets for each vertex
	var fillet1 = makeArc([innerR+filletR,0],filletR,-(Math.PI-angle)/2+Math.PI,(Math.PI-angle)/2+Math.PI);		
	
	var center2 = [Math.cos(-angle/2)*outerR-filletR,Math.sin(-angle/2)*outerR+filletR]
	var fillet2 = makeArc(center2,filletR,-angle/2+5/3*Math.PI,angle/2+5/3*Math.PI);
	
	var center3 = [Math.cos(angle/2)*outerR-filletR,Math.sin(angle/2)*outerR-filletR]
	var fillet3 = makeArc(center3,filletR,-angle/2+7/3*Math.PI,angle/2+7/3*Math.PI);
	// create outer arc of triangle
	var outerArcHalfAngle = Math.asin(fillet2[0][1]/outerR);
	var outerArc = makeArc([0,0],outerR,-outerArcHalfAngle,outerArcHalfAngle);	
	
	// connect inner fillet, line, bottom fillet, outer arc, top fillet, line (to start of inner fillet)
	result = result.concat(fillet1);
	result = result.concat(fillet2);	// last of prior will connect to first of next when drawn
	result = result.concat(outerArc);
	result = result.concat(fillet3);
	result.push(fillet1[0]);	// connect fillet3 to the start of fillet1
	
	return result;
	
}
function makeArc(center, r, startA, endA){
	var result = [];
	if (startA < 0 || endA < 0) {		// use positive angles
		startA += Math.PI*2;
		endA += Math.PI*2;
	}
	if (startA > endA) {				// move in the correct direction
		var tmp = startA;
		startA = endA;
		endA = tmp;
	}
	
	var steps = r <= 4 ? 12 : Math.floor(Math.PI*r);		// get a reasonable number of line segments for a full circle
	steps = Math.floor(Math.abs(steps * (endA-startA)/(Math.PI*2)));	// adjust for the actual angle
	var delta = (endA-startA)/steps;
	for(var i = 0; i<= steps; i++){
		result.push ([Math.cos(i*delta+startA)*r+center[0],Math.sin(i*delta+startA)*r+center[1]])
	}
	return result;
}
