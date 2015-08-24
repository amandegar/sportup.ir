app.controller('sessionCtlr',
    ["$scope", "$window", "DataService", "$modal", "$modal", "$location", "$rootScope",
    function sessionCtlr($scope, $window, DataService, $modal, $location, $rootScope) {
        console.log("session controllerv start");
        $scope.timeTableRenderObject = [];

        console.log("modal"+$scope.beginDate);
        $scope.openInfoModal = function () {
            var modalInstance = $modal.open({

              animation: $scope.animationsEnabled,
              templateUrl: 'infoModal.html',
              controller: 'ModalInstanceCtrl',
              resolve: {
                info: function() {
                  return $scope.info;
                }
              }
            });
        modalInstance.result.then(function () {
            console.log("club:"+$scope.clubId+", week:"+ $scope.week+", cell:"+ $scope.selectedEvent.cellod);
              DataService.enrollSession($scope.clubId, $scope.week, $scope.selectedEvent.cellId).then(
                    function (results) {
                        $location.change('finance/checkout/');
                    },
                    function (results) {
                        alert("enrollment has error");
                    });
            });
    }



        $scope.getInfo = function (event) {
          if(event.status && (event.capacity - event.enroll > 0)) {
            DataService.getInfo(event.prgid).then(

                 function(results) {
                     $scope.info = results.data;
                     $scope.info.cellid = event.cellid;
                     $scope.info.begin = Math.floor((event.begin) / 60) + ':' + ((((event.begin) % 60) < 10) ? '0' + ((event.begin) % 60) : ((event.begin) % 60));
                     $scope.info.end = Math.floor((event.end) / 60) + ':' + ((((event.end) % 60) < 10) ? '0' + ((event.end) % 60) : ((event.end) % 60));
                     $scope.info.date = event.date;
                     $scope.info.format = 'yyyy/MM/dd'
                     console.log($scope.info);
                     $scope.openInfoModal();
                 },
                 function (results) {
                     alert(results.status + ': ' + results.statusText);
                 });
          }
        };

        var renderTimeTable = function(events) {
            $scope.timeTableRenderObject = [];
            var lastPlan = [{begin: 0, end: 0}, {begin: 0, end: 0}, {begin: 0, end: 0}, {begin: 0, end: 0}, {begin: 0, end: 0}, {begin: 0, end: 0}, {begin: 0, end: 0}]
            var hasPlan = {0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false};
            $scope.days = ["شنبه", "یک شنبه", "دو شنبه", "سه شنبه", "چهار شنبه", "پنج شنبه", "جمعه"];
            var inInterval = function (myEvent, myTime) {
                if(!myEvent)
                    return false;
                if (myEvent.begin <= myTime && myEvent.end > myTime) {
                    return true;
                }
                return false
            }
            $scope.createLabel = function (data) {
                return Math.floor((data.end) / 60) + ':' + ((((data.end) % 60) < 10) ? '0' + ((data.end) % 60) : ((data.end) % 60))
                    + ' - ' + Math.floor((data.begin) / 60) + ':' + ((((data.begin) % 60) < 10) ? '0' + ((data.begin) % 60) : ((data.begin) % 60))
            }

            var countMinutes = function(str) {
                var splitedStr = str.split(":");
                return parseInt(splitedStr[0]) * 60 + parseInt(splitedStr[1])
            }

            var labelTimeInterval = 60;
            var planTimeInterval = 15;
            $scope.labelTimeSpan = labelTimeInterval / planTimeInterval;
            $scope.timeTableRenderObject = [];
            $scope.label = [];

            var eventIdx = 0;
            var tmp = [];
            //var minutesCount = function (myTime) {
            //    return (myTime.getHours() * 60 + myTime.getMinutes());
            //}
            var begin = countMinutes(events[eventIdx].begin);
            var end = countMinutes(events[eventIdx++].end);
            var event = events[eventIdx];
            //for(var ev in events){
            //    hasPlan[events[ev].day] = true;
            //}

            for (var i = begin; i < end; i += planTimeInterval) {
                if (i % labelTimeInterval == 0)
                    $scope.label.push({begin: i, end: i + labelTimeInterval});
                var tmp = [];

                for (var dayIdx = 0; dayIdx < 7; dayIdx++) {
                    if((event != undefined) && isNaN(event.begin)) {
                        event.begin = countMinutes(event.begin);
                    }
                    if((event != undefined) &&  isNaN(event.end)) {
                        event.end = countMinutes(event.end);
                    }
                    if ((event != undefined) && (event.day == dayIdx) && (inInterval(event, i))) {
                        if (event.begin == i) {
                            lastPlan[event.day].begin = event.begin;
                            lastPlan[event.day].end = event.end;
                            event.type = 1;
                            event.Idx = eventIdx;
                            event.span = (event.end - event.begin) / planTimeInterval;
                            tmp.push(event);
                            event = events[++eventIdx];
                        }
                    }
                    else if (!inInterval(lastPlan[dayIdx], i)){
                        tmp.push({type: 0});
                    }
                }

                $scope.timeTableRenderObject.push(tmp);
            }
        }

    	var initialTable = function(clubId, week){
            //$scope.data = DataService.getSessionTable(clubId, week);
            //renderTimeTable($scope.data);
			 DataService.getSessionTable(clubId, week).then(
                 function(results) {
                     $scope.data = results.data;
                     renderTimeTable($scope.data);
                 },
                 function (results) {
                     alert(results.status + ': ' + results.statusText);
                 });
        }
        $scope.clubId = $("#club").val();
        $scope.week = 0;
		initialTable($scope.clubId, $scope.week);
}]);

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, info) {

  $scope.info = info;
  console.log(info);

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});