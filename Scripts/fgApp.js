//=========================================================
//
//     FILE : fgApp.js
//
//  PROJECT : Function Grapher - AngularJS
//
//   AUTHOR : Bill Daniels
//            Copyright 1989-2016, D+S Tech Labs, Inc.
//            All Rights Reserved
//
//=========================================================

//--- Application (root) Module ---------------------------

var app = angular.module ('FGApp', [ 'FunctionGrapher' ]);


//---------------------------------------------------------
//  Global Constants (can be injected anywhere)
//---------------------------------------------------------

app.constant ('MyConstant', 'aValue');


//---------------------------------------------------------
//  Global Values (can be injected anywhere)
//---------------------------------------------------------

app.value ('MyValue', 'aValue');


//---------------------------------------------------------
//  Run
//---------------------------------------------------------

app.run (function ($rootScope)
{
  //--- Global Data ---------------------------------------

  $rootScope.myVar = 'Hello';

  //--- Global Functions ----------------------------------

  $rootScope.Sample = function ()
  {
    try
    {
    }
    catch (ex)
    {
      ShowException (ex);
    }
  }
});


//---------------------------------------------------------
//  Directives
//---------------------------------------------------------


////---------------------------------------------------------
////  Controller
////---------------------------------------------------------
//
//app.controller ('AppController', function ($scope)
//{
//
//});
