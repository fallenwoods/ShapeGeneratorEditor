// See https://en.wikipedia.org/wiki/ISO_metric_screw_thread

var PI = Math.PI;
var cos = Math.cos;
var sin = Math.sin;
var abs = Math.abs;
var sqrt = Math.sqrt;
var atan2 = Math.atan2;
var ceil = Math.ceil;
var floor = Math.floor;
var max = Math.max;

/*
var Mesh3D = Core.Mesh3D;
//var Path2D = Core.Path2D;
var Matrix3D = Core.Matrix3D;
var Tess = Core.Tess;
var Solid = Core.Solid;
var Debug = Core.Debug;
//*/

/*
Params
	M# (coarse, fine or extra fine)
	length
derived:
pitch
diameter (is Dmaj in the reference)

steps: sufficient to give a smooth surface


*/
var screwTable = {
m:{
	'M1':{label:'M1',diameter:1,coarse:0.25,fine:0.2,extraFine:0.2},
	'M1.2':{label:'M1.2',diameter:1.2,coarse:0.25,fine:0.2,extraFine:0.2},
	'M1.4':{label:'M1.4',diameter:1.4,coarse:0.3,fine:0.2,extraFine:0.2},
	'M1.6':{label:'M1.6',diameter:1.6,coarse:0.35,fine:0.2,extraFine:0.2},
	'M1.8':{label:'M1.8',diameter:1.8,coarse:0.35,fine:0.2,extraFine:0.2},
	'M2':{label:'M2',diameter:2,coarse:0.4,fine:0.25,extraFine:0.25},
	'M2.5':{label:'M2.5',diameter:2.5,coarse:0.45,fine:0.35,extraFine:0.35},
	'M3':{label:'M3',diameter:3,coarse:0.5,fine:0.35,extraFine:0.35},
	'M3.5':{label:'M3.5',diameter:3.5,coarse:0.6,fine:0.35,extraFine:0.35},
	'M4':{label:'M4',diameter:4,coarse:0.7,fine:0.5,extraFine:0.5},
	'M5':{label:'M5',diameter:5,coarse:0.8,fine:0.5,extraFine:0.5},
	'M6':{label:'M6',diameter:6,coarse:1,fine:0.75,extraFine:0.75},
	'M7':{label:'M7',diameter:7,coarse:1,fine:0.75,extraFine:0.75},
	'M8':{label:'M8',diameter:8,coarse:1.25,fine:1,extraFine:0.75},
	'M10':{label:'M10',diameter:10,coarse:1.5,fine:1.25,extraFine:1},
	'M12':{label:'M12',diameter:12,coarse:1.75,fine:1.5,extraFine:1.25},
	'M14':{label:'M14',diameter:14,coarse:2,fine:1.5,extraFine:1.5},
	'M16':{label:'M16',diameter:16,coarse:2,fine:1.5,extraFine:1.5},
	'M18':{label:'M18',diameter:18,coarse:2.5,fine:2,extraFine:1.5},
	'M20':{label:'M20',diameter:20,coarse:2.5,fine:2,extraFine:1.5},
	'M22':{label:'M22',diameter:22,coarse:2.5,fine:2,extraFine:1.5},
	'M24':{label:'M24',diameter:24,coarse:3,fine:2,extraFine:2},
	'M27':{label:'M27',diameter:27,coarse:3,fine:2,extraFine:2},
	'M30':{label:'M30',diameter:30,coarse:3.5,fine:2,extraFine:2},
	'M33':{label:'M33',diameter:33,coarse:3.5,fine:2,extraFine:2},
	'M36':{label:'M36',diameter:36,coarse:4,fine:3,extraFine:3},
	'M39':{label:'M39',diameter:39,coarse:4,fine:3,extraFine:3},
	'M42':{label:'M42',diameter:42,coarse:4.5,fine:3,extraFine:3},
	'M45':{label:'M45',diameter:45,coarse:4.5,fine:3,extraFine:3},
	'M48':{label:'M48',diameter:48,coarse:5,fine:3,extraFine:3},
	'M52':{label:'M52',diameter:52,coarse:5,fine:4,extraFine:4},
	'M56':{label:'M56',diameter:56,coarse:5.5,fine:4,extraFine:4},
	'M60':{label:'M60',diameter:60,coarse:5.5,fine:4,extraFine:4},
	'M64':{label:'M64',diameter:64,coarse:6,fine:4,extraFine:4}

},
u:{
	'us0':{label:'#0-80/80/80',diameter:0.06,coarse:80,fine:80,extraFine:80},
	'us1':{label:'#1-64/72/72',diameter:0.073,coarse:64,fine:72,extraFine:72},
	'us2':{label:'#2-56/64/64',diameter:0.086,coarse:56,fine:64,extraFine:64},
	'us3':{label:'#3-48/56/56',diameter:0.099,coarse:48,fine:56,extraFine:56},
	'us4':{label:'#4-40/48/48',diameter:0.112,coarse:40,fine:48,extraFine:48},
	'us5':{label:'#5-40/44/44',diameter:0.125,coarse:40,fine:44,extraFine:44},
	'us6':{label:'#6-32/40/40',diameter:0.138,coarse:32,fine:40,extraFine:40},
	'us8':{label:'#8-32/36/36',diameter:0.164,coarse:32,fine:36,extraFine:36},
	'us10':{label:'#10-24/32/32',diameter:0.19,coarse:24,fine:32,extraFine:32},
	'us12':{label:'#12-24/28/32',diameter:0.216,coarse:24,fine:28,extraFine:32},
	'us1-4':{label:'1/4-20/28/32',diameter:0.25,coarse:20,fine:28,extraFine:32},
	'us5-16':{label:'5/16-18/24/32',diameter:0.3125,coarse:18,fine:24,extraFine:32},
	'us3-8':{label:'3/8-16/24/32',diameter:0.375,coarse:16,fine:24,extraFine:32},
	'us7-16':{label:'7/16-14/20/28',diameter:0.4375,coarse:14,fine:20,extraFine:28},
	'us1-2':{label:'1/2-13/20/28',diameter:0.5,coarse:13,fine:20,extraFine:28},
	'us9-16':{label:'9/16-12/18/24',diameter:0.5625,coarse:12,fine:18,extraFine:24},
	'us5-8':{label:'5/8-11/18/24',diameter:0.625,coarse:11,fine:18,extraFine:24},
	'us3-4':{label:'3/4-10/16/20',diameter:0.75,coarse:10,fine:16,extraFine:20},
	'us7-8':{label:'7/8-9/14/20',diameter:0.875,coarse:9,fine:14,extraFine:20},
	'us1':{label:'1-8/12/20',diameter:1,coarse:8,fine:12,extraFine:20},
	'us1s':{label:'1-8/14/20',diameter:1,coarse:8,fine:14,extraFine:20}
}
};



function shapeGeneratorDefaults(callback) {
var params = [
	{
		"type"			: "list",
		"id"			: "standard",
		"displayName"	: "Standard (Us or Metric)",
		"listLabels"	: ["US","Metric"],
		"listValues"	: ["u","m"],
		"default"		: "m"
	},
	{
		"type"			: "list",
		"id"			: "metrixScrewSize",
		"displayName"	: "Metrix Screw size",
		"listLabels"	: ["M4","M5","M6"],
		"listValues"	: ["M4","M5","M6"],
		"default"		: "M5"
	},
	{
		"type"			: "list",
		"id"			: "usScrewSize",
		"displayName"	: "US Screw size",
		"listLabels"	: ["M4","M5","M6"],
		"listValues"	: ["M4","M5","M6"],
		"default"		: 'us1-4'
	},
	{
		"type"			: "list",
		"id"			: "coarseness",
		"displayName"	: "Size Specifies",
		"listLabels"	: ["Coarse","Fine","Extra Fine"],
		"listValues"	: ["coarse","fine","extraFine"],
		"default"		: "coarse"
	},
	{ 	
		"id"			: "length", 
		"displayName"	: "Length",
		"type"			: "int",
		"rangeMin"		: 0,
		"rangeMax"		: 100,
		"default"		: 20
	}
];


	for (var prop in screwTable.m){
		params[1].listLabels.push(screwTable.m[prop].label);
		params[1].listValues.push(prop);
	}

	for (var prop in screwTable.u){
		params[2].listLabels.push(screwTable.u[prop].label);
		params[2].listValues.push(prop);
	}
	
	callback(params);
}

var mmPerInch = 25.4;
function shapeGeneratorEvaluate(params, callback) {
	var metrixScrewSize = params["metrixScrewSize"];			// from drop down
	var usScrewSize = params["usScrewSize"];			// from drop down
	var standard = params["standard"];		// us or metric
	var coarseness = params["coarseness"];	// coarse, fine or extraFine
	var l = params["length"];				// inches or mm

	var p,d;
	if(standard==='u'){
		p = (1/screwTable[standard][usScrewSize][coarseness]) * mmPerInch;	// pitch convert Threads per inch to inch per thread and then to mm
		d = screwTable[standard][usScrewSize].diameter * mmPerInch;		// diameter (Dmaj) in mm
	} else {
		p = screwTable[standard][metrixScrewSize][coarseness];	// pitch
		d = screwTable[standard][metrixScrewSize].diameter;		// diameter (Dmaj)
	}
	var h = p * cos(2*PI/12);		// cos(30) degrees. Height from reference bottom to reference top, top and bottom are cut off for real thread

	// See https://en.wikipedia.org/wiki/ISO_metric_screw_thread
	var profile = new Polyline3D(				//external (e.g. bolt or screw) thread profile (make this a hole to create a nut or socket)
		//[0,0,0],
		[p*1/4,0,0],
		[p*(1/4+5/16),h*5/8,0],
		[p*(1/4+5/16+1/8),h*5/8,0],
		[p,0,0]
	);		
	
	var yOffset = d/2 - (h*5/8);		// distance from center to base of tooth
	var rotations = ceil(l/p);				// pitch is length per rotation, force this to an int to make the end cap easier
	l = rotations * p;					// a bit of a cheat here, adjust length so it's an integral of the pitch
	var steps = max(50, floor(d * PI));		// one step per mm of circumferance, but not less than 20

	// fixme - figure out the end caps
	//var prior = profile.clone().translation(0,0,0);//debug (0,yOffset,0);
	var prior = new Polyline3D(profile.translation(0,yOffset,0).points());
	var deltaA = 2*PI/steps;
	var deltaX = p/steps;
	var mesh = new Mesh3D();
	
	// create a profile for the whole screw w/ caps
	//var fullProfile = [[0,0,0],[0,yOffset,0]];
	var fullProfile = profile.points();
	for(var i = 1; i< rotations-1;i++){
		var oneToothPts = profile.translation(p,0,0).points();
		fullProfile = fullProfile.concat(oneToothPts);
	}
	//fullProfile.push([l,yOffset,0]);
	//fullProfile.push([l,0,0]);
	

	
	// thread
	//*
	var startCap = new Polyline3D([0,0,0],[0,yOffset,0]);
	var endCap = new Polyline3D([l,yOffset,0],[l,0,0]);
	var priorPts = startCap.points().concat(fullProfile).concat(endCap.points());
	//var firstPts = priorPts.slice();
	var current =new Polyline3D(fullProfile);
	for(var s = 0; s < steps; s++){
		current.rotationX(deltaA).translation(deltaX,0,0);
		startCap.rotationX(deltaA);
		endCap.rotationX(deltaA);
		currentPts = startCap.points().concat(current.points()).concat(endCap.points());
		makeMesh(mesh,priorPts,currentPts);
		mesh.debugLines(priorPts);
		priorPts = currentPts;
	}
	//makeMesh(mesh,currentPts,firstPts)
	var lastPts = priorPts;
	var len = priorPts.length-6;		// 2 extra for the end cap
	mesh.triangle(lastPts[len],lastPts[len+2],lastPts[len+1]);		// cap the end of the thread
	mesh.triangle(lastPts[len],lastPts[len+3],lastPts[len+2]);
	
	mesh.triangle(fullProfile[0],fullProfile[1],fullProfile[2]);		// cap the start of the thread
	mesh.triangle(fullProfile[0],fullProfile[2],fullProfile[3]);
	//* /

	
	//mesh.combine(mesh);
	callback(Solid.make(mesh));
}
function Polyline3D(){
	this.pts=[];
	this.mat = new Matrix3D();
	if(arguments.length === 0) return;
	var argAry = typeof arguments[0][0] === 'object' ? Array.prototype.slice.call(arguments[0]) : Array.prototype.slice.call(arguments);
	if(argAry.length>0) argAry.forEach(function(el,i){
		this.pts.push(new THREE.Vector3(argAry[i][0],argAry[i][1],argAry[i][2]));
		}.bind(this));
}
Polyline3D.prototype = {
	copy:function(other){
		this.pts = other.pts.slice();
		this.mat.transform.elements = other.mat.transform.elements.slice();
		return this;
	},
	clone: function(){return new Polyline3D().copy(this);},
	translation: function(x,y,z){this.mat.translation(x,y,z); return this;},
	rotationX:function(a){this.mat.rotationX(a); return this;},
	rotationY:function(a){this.mat.rotationY(a); return this;},
	rotationZ:function(a){this.mat.rotationZ(a); return this;},
	points:function(){
		 return this.pts.map(function(el,i){
		 	var tmp = el.clone().applyMatrix4(this.mat.transform);
			 return [tmp.x,tmp.y,tmp.z];}.bind(this));
	}
};
function makeMesh(mesh,priorPts,currentPts){
	//var priorPts = prior.points();	// gets transformed points
	//var currentPts = current.points();
	for(var i = 0; i < priorPts.length-1;i++){
		mesh.triangle(priorPts[i],currentPts[i],priorPts[i+1]);
		mesh.triangle(priorPts[i+1],currentPts[i],currentPts[i+1]);
	}
}