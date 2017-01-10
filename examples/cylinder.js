// Convenience Declarations For Dependencies.
// 'Core' Is Configured In Libraries Section.
// Some of these may not be used by this example.
/*
var Conversions = Core.Conversions;
var Debug = Core.Debug;
var Path2D = Core.Path2D;
var Point2D = Core.Point2D;
var Point3D = Core.Point3D;
var Matrix2D = Core.Matrix2D;
var Matrix3D = Core.Matrix3D;

var Plugin = Core.Plugin;
var Tess = Core.Tess;
var Sketch2D = Core.Sketch2D;
var Solid = Core.Solid;
var Vector2D = Core.Vector2D;
var Vector3D = Core.Vector3D;
*/
var Tess = Core.Tess;
var Mesh3D = Core.Mesh3D;
var Solid = Core.Solid;

// Template Code:
params = [
    { "id": "r1", "displayName": "Bottom Radius", "type": "length", "rangeMin": 0, "rangeMax": 100, "default": 10.0 },
    { "id": "r2", "displayName": "Top Radius", "type": "length", "rangeMin": 0, "rangeMax": 100, "default": 10.0 },
    { "id": "height", "displayName": "Height", "type": "length", "rangeMin": 1.0, "rangeMax": 100.0, "default": 20.0 }
];

function process(params) {
    var height = params["height"];
    var r1 = params["r1"];
    var r2 = params["r2"];
    var cl = [0,0,0];
    var ch = [0,0,height];
    var pl = [r1,0,0];
    var ph = [r2,0,height];
    var ndivs = Tess.circleDivisions(Math.max(r1,r2));
    
    var mesh = new Mesh3D();
    for (var i = 0; i < ndivs; i++) {
        var a = (i+1)/ndivs * Math.PI*2;
        var s = Math.sin(a);
        var c = Math.cos(a);
        var nl = [r1*c, -r1*s, 0];
        var nh = [r2*c, -r2*s, height];
        mesh.triangle(pl, ph, nl);
        mesh.triangle(nl, ph, nh);
        mesh.triangle(cl, pl, nl);
        mesh.triangle(ch, nh, ph);
        pl = nl;
        ph = nh;
    }

    var solid = Solid.make(mesh);
    return solid;
}