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

