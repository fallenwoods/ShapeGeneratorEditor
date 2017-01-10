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

function process(params) {
	var module = params["module"];
	var nTeeth = params["nTeeth"];
	var pitchA = params["pitchAngle"];

	if( module < 0.1 )
		module = 0.1;
	
	var nominalD = nTeeth * module;
	var innerR = nominalD / 2 - module;
	var outerR = nominalD / 2 + module;

	var px = innerR;
	var py = 0;
	//var ndivs = //nTeeth;//Tess.circleDivisions(Math.max(r1,r2));

	var inv = involute(nTeeth, module, pitchA);
	
	var path = new Path2D();
	path.moveTo( innerR, 0 );

	for (var i = 0; i < nTeeth; i++)
	{
		var a = (i + 0.25) * Math.PI * 2 / nTeeth;

		for( var j = 0; j < inv.length; j++ )
		{
			var ang = a + inv[j][0];
			var rad = inv[j][1];

			var x = Math.cos(ang) * rad;
			var y = Math.sin(ang) * rad;
			
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

	var solid = Solid.extrude([path], 20.0);
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