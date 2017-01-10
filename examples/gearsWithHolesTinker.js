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
		var a = (i + 0.25) * Math.PI * 2 / nTeeth;

		for( var j = 0; j < inv.length; j++ )
		{
			var ang = a + inv[j][0];
			var rad = inv[j][1];

			var x = Math.cos(ang) * rad;
			var y = Math.sin(ang) * rad;
			
			if(i == 0 && j==0) path.moveTo( x, y );
			
			path.lineTo( x, y );
		}

		a = (i + 0.75) * Math.PI * 2 / nTeeth;

		for( var j = inv.length - 1; j >= 0; j-- )
		{
			var ang = a - inv[j][0];
			var rad = inv[j][1];

			var x = Math.cos(ang) * rad;
			var y = Math.sin(ang) * rad;
			
			path.lineTo( x, y );
		}
	}
	path.close();
	
	var paths = [];
	paths.push(path);
	
	for(var sp = 0; sp < spokeCount; sp++){
		var gap = spokeGap(axle, innerR, spokeCount, 2);
		if(!gap) break;
		gap = rotate(gap,sp*(2*Math.PI/spokeCount));
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
		axlePath.lineTo(axle*Math.cos(-i*2*Math.PI/20),axle*Math.sin(-i*2*Math.PI/20));
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

var spokeThickness = 2;
// this creates a single gap. It should be copied and transformed by 2*PI/spokeCount spokeCount times
function spokeGap(hubR, outerR, spokeCount){
	var result=[];
	var shape = new THREE.Shape();		// fixme - replace THREE with svg code
	
	var angle = Math.PI/spokeCount;		//same as (2*PI/spokeCount)/2
	
	//fixme -  to deal with the hub, we really need two points at the bottom
	// the calculation is very similar ot that used on the current top end
	var st = spokeThickness + hubR/spokeCount;  //fixme -  to deal with the hub, we really need two points at the bottom
	
	// Center fillet
	var cfCenter = [st/Math.sin(angle),0],
		cfStart = [st*Math.cos(-angle)+cfCenter[0],st*Math.sin(-angle)],
		cfEnd=[st*Math.cos(angle)+cfCenter[0],st*Math.sin(angle)];
			
	// Left (Top) fillet
	// For the points at the origin, and then rotate to the correct angle
	var offsetAngle = st/(outerR-st);
	var lfCenter = [(outerR-st)*Math.cos(angle-offsetAngle),(outerR-st)*Math.sin(angle-offsetAngle)],
		lfStart = [-st*Math.cos(angle)+lfCenter[0],-st*Math.sin(angle)+lfCenter[1]],
		lfEnd=[(outerR-st)*Math.cos(angle-(2*offsetAngle)),(outerR-st)*Math.sin(angle-(2*offsetAngle))];
	
	// Right (Bottom) fillet
	// For the points at the origin, and then rotate to the correct angle
	var rfStart = [lfEnd[0],-lfEnd[1]],	
		rfEnd=[lfStart[0],-lfStart[1]],
		rfCenter = [lfCenter[0],-lfCenter[1]];
	
	if(lfEnd[1]<rfStart[1]) return null;	// degenerate case, gap is too small for fillets
	
	shape.moveTo(cfStart[0],cfStart[1]);
	shape.quadraticCurveTo(cfCenter[0],cfCenter[1],cfEnd[0],cfEnd[1]);
	shape.lineTo(lfStart[0],lfStart[1]);
	shape.quadraticCurveTo(lfCenter[0],lfCenter[1],lfEnd[0],lfEnd[1]);
	shape.absarc ( 0, 0, (outerR-st), (angle-(2*offsetAngle)), -(angle-(2*offsetAngle)), true )	
	shape.quadraticCurveTo(rfCenter[0],rfCenter[1],rfEnd[0],rfEnd[1])
	shape.lineTo(cfStart[0],cfStart[1]);

	
	var v2dpts = shape.extractPoints().shape;
	result=[];
	for(var i = 0; i < v2dpts.length;i++){
		result.push([v2dpts[i].x,v2dpts[i].y]);
	}
	
	return result;
	
}
function rotate(points,r){
	var result = [];
	for(var i = 0 ; i<points.length;i++){
		result.push([
			points[i][0] * Math.cos(r) - points[i][1] * Math.sin(r) ,
			points[i][0] * Math.sin(r) + points[i][1] * Math.cos(r)
		]);
	}
	return result;
}