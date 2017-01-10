// See https://en.wikipedia.org/wiki/ISO_metric_screw_thread

/*
Params
	M# (coarse, fine or extra fine)
	length
derived:
pitch
diameter (is Dmaj in the reference)

steps: sufficient to give a smooth surface


*/
var metricTable = [
{M1:{diameter:1,coarse:0.25,fine:0.2,extraFine:0.2}},
{M1_2:{diameter:1.2,coarse:0.25,fine:0.2,extraFine:0.2}},
{M1_4:{diameter:1.4,coarse:0.3,fine:0.2,extraFine:0.2}},
{M1_6:{diameter:1.6,coarse:0.35,fine:0.2,extraFine:0.2}},
{M1_8:{diameter:1.8,coarse:0.35,fine:0.2,extraFine:0.2}},
{M2:{diameter:2,coarse:0.4,fine:0.25,extraFine:0.25}},
{M2_5:{diameter:2.5,coarse:0.45,fine:0.35,extraFine:0.35}},
{M3:{diameter:3,coarse:0.5,fine:0.35,extraFine:0.35}},
{M3_5:{diameter:3.5,coarse:0.6,fine:0.35,extraFine:0.35}},
{M4:{diameter:4,coarse:0.7,fine:0.5,extraFine:0.5}},
{M5:{diameter:5,coarse:0.8,fine:0.5,extraFine:0.5}},
{M6:{diameter:6,coarse:1,fine:0.75,extraFine:0.75}},
{M7:{diameter:7,coarse:1,fine:0.75,extraFine:0.75}},
{M8:{diameter:8,coarse:1.25,fine:1,extraFine:0.75}},
{M10:{diameter:10,coarse:1.5,fine:1.25,extraFine:1}},
{M12:{diameter:12,coarse:1.75,fine:1.5,extraFine:1.25}},
{M14:{diameter:14,coarse:2,fine:1.5,extraFine:1.5}},
{M16:{diameter:16,coarse:2,fine:1.5,extraFine:1.5}},
{M18:{diameter:18,coarse:2.5,fine:2,extraFine:1.5}},
{M20:{diameter:20,coarse:2.5,fine:2,extraFine:1.5}},
{M22:{diameter:22,coarse:2.5,fine:2,extraFine:1.5}},
{M24:{diameter:24,coarse:3,fine:2,extraFine:2}},
{M27:{diameter:27,coarse:3,fine:2,extraFine:2}},
{M30:{diameter:30,coarse:3.5,fine:2,extraFine:2}},
{M33:{diameter:33,coarse:3.5,fine:2,extraFine:2}},
{M36:{diameter:36,coarse:4,fine:3,extraFine:3}},
{M39:{diameter:39,coarse:4,fine:3,extraFine:3}},
{M42:{diameter:42,coarse:4.5,fine:3,extraFine:3}},
{M45:{diameter:45,coarse:4.5,fine:3,extraFine:3}},
{M48:{diameter:48,coarse:5,fine:3,extraFine:3}},
{M52:{diameter:52,coarse:5,fine:4,extraFine:4}},
{M56:{diameter:56,coarse:5.5,fine:4,extraFine:4}},
{M60:{diameter:60,coarse:5.5,fine:4,extraFine:4}},
{M64:{diameter:64,coarse:6,fine:4,extraFine:4}}
];

function process(params){
	var screw = params["screw"];			// from drop down
	var standard = params["standard"];		// us or metric
	var coarseness = params["coarseness"];	// coarse, fine or extraFine
	var l = params["length"];				// inches or mm

	
	var p = tables[type][screw][coarseness];	// pitch
	var d = tables[type][screw].diameter;		// diameter (Dmaj)
	var h = p * cos(2*PI/12);		// cos(30) degrees. Height from reference bottom to reference top, top and bottom are cut off for real thread

	// See https://en.wikipedia.org/wiki/ISO_metric_screw_thread
	var profile = new polyline3D(				//external (e.g. bolt or screw) thread profile (make this a hole to create a nut or socket)
		[0,0,0],
		[p*1/2,0,0],
		[h*5/8,p*(1/2+5/16),0],
		[h*5/8,p*(1/2+5/16+1/8),0],
		[0,p,0]
	);		
	
	var yOffset = d/2 - (h*5/8);		// distance from center to base of tooth
	var rotations = ceil(l/p);				// pitch is length per rotation, force this to an int to make the end cap easier
	var steps = max(20, d * PI);		// one step per mm of circumferance, but not less than 20

	// fixme - figure out the end caps
	var prior = profile.clone().translation(0,yOffset,0);
	var deltaA = 2*PI/steps;
	var deltaX = p/steps;
	var mesh = new Mesh3D();
	
	// start cap
	var pCapCorner=new polyline3D([0,yOffset,0]);
	var pThreadCorner=new polyline3D([0,yOffset,0]);
	var cCapCorner=cCapCorner.clone();
	var cThreadCorner=cThreadCorner.clone();
	for(var s = 0; s < steps; s++){
		// fixme - don't clone here - copy at the bottom
		cCapCorner.rotationX(deltaA);		//rotate but don't translation;
		cThreadCorner.rotationX(deltaA).translation(deltaX,0,0);	// rotate and translation
		
		mesh.triangle([0,0,0],pCapCorner,cCapCorner);
		mesh.triangle(pCapCorner,pThreadCorner,cCapCorner);
		mesh.triangle(cCapCorner,pThreadCorner,cThreadCorner);
		
		pCapCorner.copy(cCapCorner);
		pThreadCorner.copy(cThreadCorner);
	}
	
	// thread
	var current = prior.clone();
	for(var s = 0; s < rotations*steps; s++){
		current.rotationX(deltaA).translation(deltaX,0,0);
		makeMesh(mesh,prior,current);
		prior.copy(current);
	}
	
	// end cap
	var pCapCorner=new polyline3D([l,yOffset,0]);	// this is why rotation has to be an int, so that lies on the z=0 plane
	var pThreadCorner=new polyline3D([l-p,yOffset,0]);
	var cCapCorner=cCapCorner.clone();
	var cThreadCorner=cThreadCorner.clone();
	
	for(var s = 0; s < steps; s++){
		cCapCorner.rotationX(deltaA);		//rotate but don't translation;
		cThreadCorner.rotationX(deltaA).translation(deltaX,0,0);	// rotate and translation
		
		mesh.triangle([l,0,0],pCapCorner,cCapCorner);
		mesh.triangle(pCapCorner,pThreadCorner,cCapCorner);
		mesh.triangle(cCapCorner,pThreadCorner,cThreadCorner);
		
		pCapCorner.copy(cCapCorner);
		pThreadCorner.copy(cThreadCorner);
	}
	
	mesh.combine;
	return Solid.make(mesh);
}
function polyline3D(args){
	this.pts=[];
	this.mat = new matrix3D();
	if(args) args.foreach(function(el){this.pts.push(new Vector3D(args[i][0],args[i][1],args[i][2]))});
}
Polyline3D.prototype = {
	copy:function(other){
		this.pts = other.pts.slice();
		this.mat.elements = other.mat.elements.slice();
		return this;
	},
	clone: function(){return new polyline3D().copy(this);},
	translation: function(x,y,z){this.mat.translation(x,y,z); return this;},
	rotationX:function(a){this.mat.rotationX(a); return this;},
	rotationY:function(a){this.mat.rotationY(a); return this;},
	rotationZ:function(a){this.mat.rotationZ(a); return this;},
	points:function(){
		 return this.pts.slice().map(function(el,i){el.transform(this.mat});
	}
}
function makeMesh(mesh,prior,current){
	for(var i = 0; i < prior.length-1;i++){
		mesh.triangle(prior[i],prior[i+1],current[i]);
		mesh.triangle(prior[i+1],current[i+1],current[i]);
	}
}