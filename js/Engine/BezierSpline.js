
/*
 * Class from https://www.codeproject.com/Articles/31859/Draw-a-Smooth-Curve-through-a-Set-of-D-Points-wit
 * By Oleg V. Polikarpotchkin, Peter Lee
 * Translated to Javascript by Daniel Meurer
 * @type type
 */
var BezierSpline = {};
/**
 * Get open-ended Bezier Spline Control Points.
 * @param {Point-Array} knots Input Knot Bezier spline points.
 * @returns {Object}
 */
BezierSpline.GetCurveControlPoints = function(knots){
    
    if(arguments.length < 1)
        return false;
    
    if(knots.length < 2)
        return false;
    
    var firstControlPoints = [];
    var secondControlPoints = [];
    
    var n = knots.length - 1;
    
    if (n == 1){ 
    // Special case: Bezier curve should be a straight line.
        // 3P1 = 2P0 + P3
        firstControlPoints[0] = {
            x: (2 * knots[0].x + knots[1].x) / 3,
            y: (2 * knots[0].y + knots[1].y) / 3
        };
        // P2 = 2P1 – P0
        secondControlPoints[0] = {
            x : 2 * firstControlPoints[0].x - knots[0].x,
            y :  2 * firstControlPoints[0].y - knots[0].y
        };
        
        return [firstControlPoints, secondControlPoints];
        
    }
    
    // Calculate first Bezier control points
    // Right hand side vector
    
    var rhs = [];
    
    for (var i = 1; i < n - 1; i++)
        rhs[i] = 4 * knots[i].x + 2 * knots[i + 1].x;
    
    rhs[0] = knots[0].x + 2 * knots[1].x;
    rhs[n - 1] = (8 * knots[n - 1].x + knots[n].x) / 2;
    
    // Get first control points X-values
    var x = BezierSpline.GetFirstControlPoints(rhs);
    
    // Set right hand side Y values
    for (var i = 1; i < n - 1; i++)
        rhs[i] = 4 * knots[i].y + 2 * knots[i + 1].y;
    
    rhs[0] = knots[0].y + 2 * knots[1].y;
    rhs[n - 1] = (8 * knots[n - 1].y + knots[n].y) / 2;
    // Get first control points Y-values
    var y = BezierSpline.GetFirstControlPoints(rhs);
    
    // Fill output arrays.

    for (var i = 0; i < n; i++){
        // First control point
        firstControlPoints[i] = { x : x[i], y : y[i]};
        // Second control point
        if (i < n - 1)
                secondControlPoints[i] = {
                    x : 2 * knots[i + 1].x - x[i + 1],
                    y : 2 * knots[i + 1].y - y[i + 1]
                };
        else
                secondControlPoints[i] = {
                    x : (knots[n].x + x[n - 1]) / 2,
                    y : (knots[n].Y + y[n - 1]) / 2
                };
    }
    
    return [firstControlPoints, secondControlPoints];
};
/**
 * Solves a tridiagonal system for one of coordinates (x or y) of first Bezier control points.
 * @param {Number-Array} rhs Right hand side vector.
 * @returns {Number-Array} Solution vector
 */
BezierSpline.GetFirstControlPoints = function(rhs){
    var n = rhs.length;
    var x = []; // Solution vector.
    var tmp = []; // Temp workspace.

    var b = 2;
    
    x[0] = rhs[0] / b;
    
    for (var i = 1; i < n; i++){
        // Decomposition and forward substitution.
        tmp[i] = 1 / b;
        b = (i < n - 1 ? 4.0 : 3.5) - tmp[i];
        x[i] = (rhs[i] - x[i - 1]) / b;
    }
    for (var i = 1; i < n; i++)
        x[n - i - 1] -= tmp[n - i] * x[n - i]; // Backsubstitution.

    return x;
};