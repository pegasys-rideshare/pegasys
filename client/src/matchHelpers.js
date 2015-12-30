angular.module('pegasys.matchHelpers', [])
  
  .factory('matchHelpers', function ($log, DB) {

    var matchHelpers = {};

    matchHelpers.getMatches = function(user, users, range){
      // Convert given miles from 'range' into meters.
      // Defualut to the equivelant of .25 miles in meters.
      var rangeMeters = range / 0.00062137 || 402.336;
      var matches = matchHelpers.compareUsers(user, users, matchHelpers.compareRoutes, rangeMeters);
      return matches;
    };

    matchHelpers.filterTripTimes = function(driver, rider){
      if(driver.startTime[0] > rider.startTime[1]){
        return false;
      }
      if(driver.endTime[1] < rider.endTime[0]){
        return false;
      }

      return true;
    };

    matchHelpers.filterDriverStatus = function(user, users){
    var options = [];
    var userStatus = user.driver;

    for(var i = 0; i < users.length; i++){
      if(users[i].driver !== userStatus){
        options.push(users[i]);
      }
    }

    return options;
  };

  matchHelpers.compareUsers = function(user, users, callback, range){
    var driver;
    var rider;
    var option;
    // An array of the user's matches
    var userOptions = [];

    for(var i = 0; i < users.length; i++){
      if(user.driver === true){
        driver = user;
        rider = users[i];
        option = rider;
      }else{
        driver = users[i];
        rider = user;
        option = driver;
      }

      // Parse JSON object representing trips
      // Iterate over trips object
      var optionTrips = JSON.parse(option.trips);
        for(var trip in optionTrips){
          if(user.driver === trip.driver) continue;
          var matchedPoints;
          if(option === driver){
            matchedPoints = callback(optionTrips[trip], rider, range);
          }else{
            matchedPoints = callback(driver, optionTrips[trip], range);
          }
          if(matchedPoints !== false){
            // ToDo: pass driver and rider to filterDriverStatus
            // Push an object containing the user id and the matched route points
            var optionMatch = {};
            optionMatch.id = option._id;
            optionMatch.username = option.username;
            optionMatch.matchedPoints = matchedPoints;
            optionMatch.route = trip.route || [];
            userOptions.push(optionMatch);
          }
        }
    

     
    }

    return userOptions;
  };

  matchHelpers.compareRoutes = function(driver, rider, range){
    // Make sure the driver actually has a route before preceding
    if(!driver.route) return false;

    var riderStart = rider.startPoint;
    var riderEnd = rider.endPoint;
    var rSMatch = false;
    var route = driver.route;
    var matchingPoints = false;
    $log.log('driver', driver);
    $log.log('rider', rider);

    var toRad = function(number){
      return number * Math.PI / 180;
    }

    for(var i = 0; i < route.length; i++){
      // Check whether the rider's start point has been matched to the route
      var riderPoint;
      var routePoint = route[i];
      if(rSMatch === false){
        riderPoint = riderStart;
      }else{
        riderPoint = riderEnd;
      }

      // If routePoint is not a pair of coordinates then return false
      if(!routePoint[0]) return false;

      // The majority of this formula was provided by http://www.movable-type.co.uk/scripts/latlong.html
      // It is a javascript form of the haversine formula
      var R = 6371000;
      var lat1 = toRad(routePoint[0]);
      var lat2 = toRad(riderPoint[0]);
      var latDiff = toRad(riderPoint[0] - routePoint[0]);
      var lngDiff = toRad(riderPoint[1] - routePoint[1]);

      var a = Math.sin(latDiff/2) * Math.sin(latDiff/2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(lngDiff/2) * Math.sin(lngDiff/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c;

      if(d > range) continue;


      // If rider start point has not yet been matched, then begin the array
      // of the driver's matched route points
      if(rSMatch === false){
        rSMatch = true;
        matchingPoints = [[routePoint[0], routePoint[1]]];
      // If rider start point has been matched, then add the matched route point
      // to the existing array of driver's matched route points and return that array
      }else{
        matchingPoints.push([routePoint[0], routePoint[1]]);
        return matchingPoints
      }
    }

    // If either the start or end point for the rider has not been matched to the
    // driver's route, then return a false statement
    return false;
    };

    return matchHelpers;

  });
