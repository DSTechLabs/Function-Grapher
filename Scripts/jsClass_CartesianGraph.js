//=========================================================
//
//     FILE : jsClass_CartesianGraph.js
//
//  PROJECT : Function Grapher - AngularJS
//
//   AUTHOR : Bill Daniels
//            Copyright 1980-2016, D+S Tech Labs, Inc.
//            All Rights Reserved
//
//=========================================================

function CartesianGraph (inGCanvas, inZCanvas, functionArray)
{
  //-------------------------------------------------------
  //  Private Data
  //-------------------------------------------------------

  var self      = this;  // required so private methods can access public members
  var gCanvas   = inGCanvas;
  var zCanvas   = inZCanvas;
  var gCC       = gCanvas.getContext ("2d");
  var zCC       = zCanvas.getContext ("2d");
  var axisFont  = "normal 12px arial,sans-serif";
  var backColor = $(gCanvas).css ('background-color');
  var axisColor = '#000000';
  var gridColor = '#C0C0C0';
  var coords    = { "x":50, "y":2, "width":220, "height":16, "font":"normal 16px monospace" };

  var xMin=-10.5, xMax=10.5, xFactor;  // Real x-axis range
  var yMin=-10.5, yMax=10.5, yFactor;  // Real y-axis range

  var canvasBoundingRect, gWidth=0, gHeight=0;  // Canvas bounds

  var zoomBox = false;
  var zoomBoxColor = "rgba(0,0,255,0.3)";
  var zbAnchorX, zbAnchorY, zbDragX, zbDragY;  // Zoom box (Rubberband box)


  //-------------------------------------------------------
  //  Public Data
  //-------------------------------------------------------

  this.Axes = true;
  this.Grid = true;


  //-------------------------------------------------------
  //  Private Methods
  //-------------------------------------------------------

  //--- initCanvas ----------------------------------------

  var initCanvas = function ()
  {
    try
    {
      //--- Graph canvas ---
      gCC.scale (1, 1);                // 1:1 scale
      gCC.translate (0.5, 0.5);        // Shift canvas to whole pixels
      gCC.backingStorePixelRatio = 1;  // Video device pixel ratio
      gCC.globalCompositeOperation = 'source-over';

      // Turn off anti-aliasing
      gCC.webkitImageSmoothingEnabled = false;
      gCC.mozImageSmoothingEnabled    = false;
      gCC.imageSmoothingEnabled       = false;  // future

      // Canvas context settings
      gCC.shadowColor   = "transparent";
      gCC.shadowBlur    = 0;
      gCC.shadowOffsetX = 0;
      gCC.shadowOffsetY = 0;
      gCC.lineCap       = "butt";
      gCC.lineJoin      = "bevel";
      gCC.lineWidth     = 1;
      gCC.lineHeight    = 1;
      gCC.textAlign     = "left";
      gCC.textBaseline  = "top";

      //--- Zoom box overlay ---
      zCC.scale (1, 1);                // 1:1 scale
      zCC.translate (0.5, 0.5);        // Shift canvas to whole pixels
      zCC.backingStorePixelRatio = 1;  // Video device pixel ratio
      zCC.globalCompositeOperation = 'source-over';

      // Turn off anti-aliasing
      zCC.webkitImageSmoothingEnabled = false;
      zCC.mozImageSmoothingEnabled    = false;
      zCC.imageSmoothingEnabled       = false;  // future

      // Canvas context settings
      zCC.shadowColor   = "transparent";
      zCC.shadowBlur    = 0;
      zCC.shadowOffsetX = 0;
      zCC.shadowOffsetY = 0;
      zCC.lineCap       = "butt";
      zCC.lineJoin      = "bevel";
      zCC.lineWidth     = 1;
      zCC.lineHeight    = 1;
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- getGX ---------------------------------------------

  var getGX = function (x)
  {
    try
    {
      return Math.round (xFactor * (x - xMin));
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- getGY ---------------------------------------------

  var getGY = function (y)
  {
    try
    {
      return Math.round (gHeight - yFactor * (y - yMin));
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- drawLine ------------------------------------------

  var drawLine = function (gx1, gy1, gx2, gy2, bold)
  {
    try
    {
      gCC.lineWidth = gCC.lineHeight = (bold ? 3 : 1);

      gCC.beginPath ();
      gCC.moveTo (gx1, gy1);
      gCC.lineTo (gx2, gy2);
      gCC.stroke ();
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- drawXAxis -----------------------------------------

  var drawXAxis = function ()
  {
    try
    {
      var  gx, gy, step, x;

      // Draw axis line
      gy = getGY (0.0);
      gCC.strokeStyle = (self.Axes ? axisColor : gridColor);
      drawLine (0, gy, gWidth, gy, false);

      // Draw graduated ticks with measurements
      gCC.font         = axisFont;
      gCC.textBaseline = "top";

      step = (xMax - xMin) / 15.0;

           if (step <    0.00015) step =     0.0001;
      else if (step <    0.00035) step =     0.0002;
      else if (step <    0.00075) step =     0.0005;
      else if (step <    0.0015 ) step =     0.001 ;
      else if (step <    0.0035 ) step =     0.002 ;
      else if (step <    0.0075 ) step =     0.005 ;
      else if (step <    0.015  ) step =     0.01  ;
      else if (step <    0.035  ) step =     0.02  ;
      else if (step <    0.075  ) step =     0.05  ;
      else if (step <    0.15   ) step =     0.1   ;
      else if (step <    0.35   ) step =     0.2   ;
      else if (step <    0.75   ) step =     0.5   ;
      else if (step <    1.5    ) step =     1.0   ;
      else if (step <    3.5    ) step =     2.0   ;
      else if (step <    7.5    ) step =     5.0   ;
      else if (step <   15.0    ) step =    10.0   ;
      else if (step <   35.0    ) step =    20.0   ;
      else if (step <   75.0    ) step =    50.0   ;
      else if (step <  150.0    ) step =   100.0   ;
      else if (step <  350.0    ) step =   200.0   ;
      else if (step <  750.0    ) step =   500.0   ;
      else if (step < 1500.0    ) step =  1000.0   ;
      else if (step < 3500.0    ) step =  2000.0   ;
      else if (step < 7500.0    ) step =  5000.0   ;
      else                        step = 10000.0   ;

      gy = getGY (0.0);
      for (x=step; x<=xMax; x+=step)
      {
        gx = getGX (x);
        if (self.Axes)
        {
          gCC.strokeStyle = axisColor;
          drawLine (gx, gy-8, gx, gy+8, false);
          gCC.strokeText (x.toFixedNoPad(4), gx+2, gy+2);
        }
        if (self.Grid)
        {
          gCC.strokeStyle = gridColor;
          drawLine (gx, 0, gx, gHeight, false);
          gCC.strokeText (x.toFixedNoPad(4), gx+2, gHeight-12);
        }
      }

      if (self.Grid)
      {
        gx = getGX (0.0);
        gCC.strokeStyle = gridColor;
        gCC.strokeText ("0", gx+2, gHeight-12);
      }

      for (x=-step; x>=xMin; x-=step)
      {
        gx = getGX (x);
        if (self.Axes)
        {
          gCC.strokeStyle = axisColor;
          drawLine (gx, gy-8, gx, gy+8, false);
          gCC.strokeText (x.toFixedNoPad(4), gx+2, gy+2);
        }
        if (self.Grid)
        {
          gCC.strokeStyle = gridColor;
          drawLine (gx, 0, gx, gHeight, false);
          gCC.strokeText (x.toFixedNoPad(4), gx+2, gHeight-12);
        }
      }
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- drawYAxis -----------------------------------------

  var drawYAxis = function ()
  {
    try
    {
      var  gx, gy, step, y;

      // Draw axis line
      gx = getGX (0.0);
      gCC.strokeStyle = (self.Axes ? axisColor : gridColor);
      drawLine (gx, 0, gx, gHeight, false);

      // Draw graduated ticks with measurements
      gCC.font         = axisFont;
      gCC.textBaseline = "top";

      step = (yMax - yMin) / 15.0;

           if (step <    0.00015) step =     0.0001;
      else if (step <    0.00035) step =     0.0002;
      else if (step <    0.00075) step =     0.0005;
      else if (step <    0.0015 ) step =     0.001 ;
      else if (step <    0.0035 ) step =     0.002 ;
      else if (step <    0.0075 ) step =     0.005 ;
      else if (step <    0.015  ) step =     0.01  ;
      else if (step <    0.035  ) step =     0.02  ;
      else if (step <    0.075  ) step =     0.05  ;
      else if (step <    0.15   ) step =     0.1   ;
      else if (step <    0.35   ) step =     0.2   ;
      else if (step <    0.75   ) step =     0.5   ;
      else if (step <    1.5    ) step =     1.0   ;
      else if (step <    3.5    ) step =     2.0   ;
      else if (step <    7.5    ) step =     5.0   ;
      else if (step <   15.0    ) step =    10.0   ;
      else if (step <   35.0    ) step =    20.0   ;
      else if (step <   75.0    ) step =    50.0   ;
      else if (step <  150.0    ) step =   100.0   ;
      else if (step <  350.0    ) step =   200.0   ;
      else if (step <  750.0    ) step =   500.0   ;
      else if (step < 1500.0    ) step =  1000.0   ;
      else if (step < 3500.0    ) step =  2000.0   ;
      else if (step < 7500.0    ) step =  5000.0   ;
      else                        step = 10000.0   ;

      gx = getGX (0.0);
      for (y=step; y<=yMax; y+=step)
      {
        gy = getGY (y);
        if (self.Axes)
        {
          gCC.strokeStyle = axisColor;
          drawLine (gx-8, gy, gx+8, gy, false);
          gCC.strokeText (y.toFixedNoPad(4), gx+2, gy+2);
        }
        if (self.Grid)
        {
          gCC.strokeStyle = gridColor;
          drawLine (0, gy, gWidth, gy, false);
          gCC.strokeText (y.toFixedNoPad(4), 1, gy+2);
        }
      }

      if (self.Grid)
      {
        gy = getGY (0.0);
        gCC.strokeStyle = gridColor;
        gCC.strokeText ("0", 1, gy+2);
      }

      for (y=-step; y>=yMin; y-=step)
      {
        gy = getGY (y);
        if (self.Axes)
        {
          gCC.strokeStyle = axisColor;
          drawLine (gx-8, gy, gx+8, gy, false);
          gCC.strokeText (y.toFixedNoPad(4), gx+2, gy+2);
        }
        if (self.Grid)
        {
          gCC.strokeStyle = gridColor;
          drawLine (0, gy, gWidth, gy, false);
          gCC.strokeText (y.toFixedNoPad(4), 1, gy+2);
        }
      }
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- updateCoords --------------------------------------

  var updateCoords = function ()
  {
    try
    {
      var rX = (xMin + zbDragX / xFactor).toFixed (3).toString ();
      var rY = (yMin + (gHeight - zbDragY) / yFactor).toFixed (3).toString ();

      gCC.fillStyle = backColor;
      gCC.fillRect (coords.x, coords.y, coords.width, coords.height);

      gCC.font         = coords.font;
      gCC.textBaseline = "top";
      gCC.strokeStyle  = axisColor;
      gCC.lineWidth    = gCC.lineHeight = 1;
      gCC.strokeText (rX + ', ' + rY, coords.x, coords.y);
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- startZoomBox --------------------------------------

  var startZoomBox = function (mouseEvent)
  {
    try
    {
      // Set the anchor corner of the zoom box
      zbAnchorX = zbDragX = mouseEvent.clientX - canvasBoundingRect.left;
      zbAnchorY = zbDragY = mouseEvent.clientY - canvasBoundingRect.top ;

      zCC.fillStyle = zoomBoxColor;
      zCC.fillRect (zbAnchorX, zbAnchorY, 1, 1);
      zoomBox = true;
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- sizeZoomBox ---------------------------------------

  var sizeZoomBox = function (mouseEvent)
  {
    try
    {
      // Get new cursor position
      zbDragX = mouseEvent.clientX - canvasBoundingRect.left;
      zbDragY = mouseEvent.clientY - canvasBoundingRect.top ;
      updateCoords ();

      if (zoomBox)
      {
        // Erase overlay and fill new zoom box
        zCC.clearRect (0, 0, gWidth, gHeight);
        zCC.fillRect (zbAnchorX, zbAnchorY, zbDragX-zbAnchorX+1, zbDragY-zbAnchorY+1);
      }
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- endZoomBox ----------------------------------------

  var endZoomBox = function (mouseEvent)
  {
    try
    {
      // Erase old zoom box
      if (zoomBox)
      {
        zCC.clearRect (0, 0, gWidth, gHeight);
        zoomBox = false;
      }

      // Check if zero size
      if ((zbAnchorX == zbDragX) || (zbAnchorY == zbDragY))
        return;

      // Calculate new range values
      var newXMin = xMin + Math.min (zbAnchorX, zbDragX) / xFactor;
      var newXMax = xMin + Math.max (zbAnchorX, zbDragX) / xFactor;
      var newYMin = yMin + (gHeight - Math.max (zbAnchorY, zbDragY)) / yFactor;
      var newYMax = yMin + (gHeight - Math.min (zbAnchorY, zbDragY)) / yFactor;

      // Set new X-Y ranges
      self.SetXRange (newXMin, newXMax);
      self.SetYRange (newYMin, newYMax);

      // Redraw graph and all functions
      self.Redraw (null, null);

      // Fire 'zoomed' event (so Graph Ranges can be updated)
      $(document).trigger ('zoomed', [ newXMin, newXMax, newYMin, newYMax ]);
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- normalizeFunction ---------------------------------

  var normalizeFunctionString = function (funcString)
  {
    try
    {
      // Add Math. to user functions
      funcString = funcString.trim().toLowerCase();
      funcString = funcString
        .replaceAll ("sqrt"  , "Math.sqrt"  )
        .replaceAll ("pow"   , "Math.pow"   )
        .replaceAll ("log"   , "Math.log"   )
        .replaceAll ("exp"   , "Math.exp"   )
        .replaceAll ("asin"  , "Math.asin"  )
        .replaceAll ("acos"  , "Math.acos"  )
        .replaceAll ("atan"  , "Math.atan"  )
        .replaceAll ("abs"   , "Math.abs"   )
        .replaceAll ("round" , "Math.round" )
        .replaceAll ("floor" , "Math.floor" )
        .replaceAll ("ceil"  , "Math.ceil"  )
        .replaceAll ("min"   , "Math.min"   )
        .replaceAll ("max"   , "Math.max"   )
        .replaceAll ("random", "Math.random")
        .replaceAll ("pi"    , "(3.14159265359)");

      funcString = funcString
        .replaceAll ("Math.asin", "Math.as#n")
        .replaceAll ("Math.acos", "Math.ac#s")
        .replaceAll ("Math.atan", "Math.at#n");

      funcString = funcString
        .replaceAll ("sin", "Math.sin")
        .replaceAll ("cos", "Math.cos")
        .replaceAll ("tan", "Math.tan");

      funcString = funcString
        .replaceAll ("Math.as#n", "Math.asin")
        .replaceAll ("Math.ac#s", "Math.acos")
        .replaceAll ("Math.at#n", "Math.atan");
    }
    catch (ex)
    {
      ShowException (ex);
    }

    return funcString;
  }

  //--- plotAllFunctions ----------------------------------

  var plotAllFunctions = function ()
  {
    try
    {
      var x, y;
      var step = (xMax-xMin) / gWidth;
      var func;

      functionArray.forEach (function (element)
      {
        if (element.plot)
        {
          var funcString = normalizeFunctionString (element.functionInput);

          gCC.strokeStyle = element.plotColor;
          gCC.lineWidth = gCC.lineHeight = (element.bold ? 3 : 1);
          gCC.beginPath ();

          // Move to first point
          x = xMin;

          // Replace the variable 'x' in the function string with its real value
          // However, some math functions have an 'x' in them, like max() and exp()
          // So we need to avoid replacing those x's.
          func = funcString
            .replaceAll ("max(", "ma#(")
            .replaceAll ("exp(", "e#p(")
            .replaceAll ("x", "(" + x.toString() + ")")
            .replaceAll ("ma#(", "max(")
            .replaceAll ("e#p(", "exp(");

          // Calculate y
          try { y = eval (func); } catch (ex) { y = yMin; }

          gCC.beginPath ();
          gCC.moveTo (getGX(x), getGY(y));

          // Line to remaining points
          do
          {
            x += step;

            // Replace the variable 'x' in the function string with its real value
            // However, some math functions have an 'x' in them, like max() and exp()
            // So we need to avoid replacing those x's.
            func = funcString
              .replaceAll ("max(", "ma#(")
              .replaceAll ("exp(", "e#p(")
              .replaceAll ("x", "(" + x.toString() + ")")
              .replaceAll ("ma#(", "max(")
              .replaceAll ("e#p(", "exp(");

            // Calculate y
            try { y = eval (func); } catch (ex) { y = yMin; }

            gCC.lineTo (getGX(x), getGY(y));
          }
          while (x <= xMax);

          gCC.stroke ();
        }
      });
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }


  //-------------------------------------------------------
  //  Public Methods
  //-------------------------------------------------------

  //--- SetXRange -----------------------------------------

  this.SetXRange = function (x1, x2)
  {
    try
    {
      if (x1 != x2)
      {
        xMin = Math.min (x1, x2);
        xMax = Math.max (x1, x2);
        xFactor = gWidth / (xMax-xMin);
      }
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- SetYRange -----------------------------------------

  this.SetYRange = function (y1, y2)
  {
    try
    {
      if (y1 != y2)
      {
        yMin = Math.min (y1, y2);
        yMax = Math.max (y1, y2);
        yFactor = gHeight / (yMax-yMin);
      }
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }

  //--- Redraw --------------------------------------------

  this.Redraw = function ()
  {
    try
    {
      // Save canvas bounding rectangle
      canvasBoundingRect = zCanvas.getBoundingClientRect ();

      // Set graph pixel dimensions
      gWidth  = canvasBoundingRect.width;
      gHeight = canvasBoundingRect.height;

      // Clear canvas
      gCC.fillStyle = backColor;
      gCC.fillRect (0, 0, gWidth, gHeight);

      // Make sure real-to-graph factors ae set
      this.SetXRange (xMin, xMax);
      this.SetYRange (yMin, yMax);

      // Don't draw if too small
      if (gWidth < 5 || gHeight < 5) return;

      if (this.Axes || this.Grid)
      {
        drawXAxis ();
        drawYAxis ();
      }

      plotAllFunctions ();
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }


  //-------------------------------------------------------
  //  Constructor
  //-------------------------------------------------------
  try
  {
    // Init all canvas properties
    initCanvas ();

    // Add mouse event listeners to zoom box overlay
    zCanvas.addEventListener ("mousedown", startZoomBox);
    zCanvas.addEventListener ("mousemove", sizeZoomBox );
    zCanvas.addEventListener ("mouseup"  , endZoomBox  );
  }
  catch (ex)
  {
    ShowException (ex);
  }
}
