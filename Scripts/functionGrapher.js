//=========================================================
//
//     FILE : functionGrapher.js
//
//  PROJECT : Function Grapher - AngularJS
//
//   AUTHOR : Bill Daniels
//            Copyright 1989-2016, D+S Tech Labs, Inc.
//            All Rights Reserved
//
//=========================================================

angular.module ('FunctionGrapher', [])

  //-------------------------------------------------------
  //  Controller
  //-------------------------------------------------------
  .controller ("FGController", function ($scope, $window)
  {
    //-----------------------
    //  Data
    //-----------------------
    try
    {
      $scope.Axes = true;
      $scope.Grid = true;

      // Default plot colors
      $scope.plotColors =
      [
        "#FF0000",
        "#008000",
        "#0000FF",
        "#008080",
        "#800080",
        "#800000",
        "#FF8000",
        "#808000"
      ];

      // First function
      $scope.functionArray =
      [
        {
          "functionInput" : "x",
          "plotColor"     : $scope.plotColors[0],
          "plot"          : true,
          "bold"          : false
        }
      ];

      // Graph canvas and zoom box overlay
      var gCanvas = document.getElementById ("graphCanvas");
      var zCanvas = document.getElementById ("zoomBoxOverlay");

      // Instantiate a Cartesian Graph
      $scope.cartesianGraph = new CartesianGraph (gCanvas, zCanvas, $scope.functionArray);
    }
    catch (ex)
    {
      ShowException (ex);
    }

    //-----------------------
    //  Methods
    //-----------------------

    //--- rangeChanged ------------------------------------

    $scope.rangeChanged = function ()
    {
      try
      {
        $scope.cartesianGraph.SetXRange ($scope.xRange_Lo, $scope.xRange_Hi);
        $scope.cartesianGraph.SetYRange ($scope.yRange_Lo, $scope.yRange_Hi);
        $scope.cartesianGraph.Redraw ();
      }
      catch (ex)
      {
        ShowException (ex);
      }
    }

    //--- resetRanges -------------------------------------

    $scope.resetRanges = function ()
    {
      try
      {
        // Reset ranges to defaults
        $scope.xRange_Lo = $scope.xRange_DefaultLo;
        $scope.xRange_Hi = $scope.xRange_DefaultHi;
        $scope.yRange_Lo = $scope.yRange_DefaultLo;
        $scope.yRange_Hi = $scope.yRange_DefaultHi;
        $scope.rangeChanged ();
      }
      catch (ex)
      {
        ShowException (ex);
      }
    }

    //--- setDefaults -------------------------------------

    $scope.setDefaults = function ()
    {
      try
      {
        // Set current ranges as new defaults
        $scope.xRange_DefaultLo = $scope.xRange_Lo;
        $scope.xRange_DefaultHi = $scope.xRange_Hi;
        $scope.yRange_DefaultLo = $scope.yRange_Lo;
        $scope.yRange_DefaultHi = $scope.yRange_Hi;
      }
      catch (ex)
      {
        ShowException (ex);
      }
    }

    //--- zoomIn ------------------------------------------

    $scope.zoomIn = function ()
    {
      try
      {
        // Reduce current ranges by 1/2
        $scope.xRange_Lo /= 2;
        $scope.xRange_Hi /= 2;
        $scope.yRange_Lo /= 2;
        $scope.yRange_Hi /= 2;

        $scope.rangeChanged ();
      }
      catch (ex)
      {
        ShowException (ex);
      }
    }

    //--- zoomOut -----------------------------------------

    $scope.zoomOut = function ()
    {
      try
      {
        // Expand current ranges by 2x
        $scope.xRange_Lo *= 2;
        $scope.xRange_Hi *= 2;
        $scope.yRange_Lo *= 2;
        $scope.yRange_Hi *= 2;

        $scope.rangeChanged ();
      }
      catch (ex)
      {
        ShowException (ex);
      }
    }

    //--- axesChanged -------------------------------------

    $scope.axesChanged = function ()
    {
      try
      {
        $scope.cartesianGraph.Axes = $scope.Axes;
        $scope.cartesianGraph.Grid = $scope.Grid;
        $scope.cartesianGraph.Redraw ();
      }
      catch (ex)
      {
        ShowException (ex);
      }
    }

    //--- resizeCanvas ------------------------------------

    $scope.resizeCanvas = function ()
    {
      try
      {
        var newWidth  = GetBrowserWidth  () - $("#controlPanel").width() - 25;
        var newHeight = GetBrowserHeight () - 70;

        gCanvas.width  = zCanvas.width  = newWidth;
        gCanvas.height = zCanvas.height = newHeight;

        $scope.cartesianGraph.Redraw ();
      }
      catch (ex)
      {
        ShowException (ex);
      }
    }

    //--- addFunction -------------------------------------

    $scope.addFunction = function ()
    {
      try
      {
        $scope.functionArray.push
        ({
          "functionInput" : "",
          "plotColor"     : $scope.plotColors[$scope.functionArray.length],
          "plot"          : true,
          "bold"          : false
        });
      }
      catch (ex)
      {
        ShowException (ex);
      }
    }


    //-------------------
    //  Initialize
    //-------------------
    try
    {
      // Set size of canvas
      $scope.resizeCanvas ();

      // Set default ranges
      $scope.xRange_DefaultLo = -10.5;
      $scope.xRange_DefaultHi =  10.5;
      $scope.yRange_DefaultLo = -10.5;
      $scope.yRange_DefaultHi =  10.5;
      $scope.resetRanges ();

      // Bind browser resize event to resize the canvas
      angular.element ($window).bind ('resize', $scope.resizeCanvas);

      // Listen for "zoomed" event
      // Set range values when Graph has zoomed
      $(document).on ('zoomed', function  (event, x1, x2, y1, y2)
      {
        // Update range values
        $scope.$apply (function ()
        {
          $scope.xRange_Lo = x1;
          $scope.xRange_Hi = x2;
          $scope.yRange_Lo = y1;
          $scope.yRange_Hi = y2;
        });
      });
    }
    catch (ex)
    {
      ShowException (ex);
    }
  });
