(function () {
    angular
            .module('groups')
            .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
                .when("/groups", {
                    templateUrl: "partials/group-browsing.html",
                    controller: "GroupBrowsingController",
                    controllerAs: 'vm'
                })
                .when("/groups/:id", {
                    templateUrl: "partials/group-details.html",
                    controller: "GroupDetailsController",
                    controllerAs: 'vm',
                    resolve: {
                        group: currentGroup
                    },
                    access: {
                        noLogin: true
                    }
                });
    }


    currentGroup.$inject = ['GroupsService', 'AuthService', '$route', 'Restangular'];

    function currentGroup(GroupsService, AuthService, $route, Restangular) {
        var groupId = $route.current.params.id;
        //sTODO: refactor
        return GroupsService.one(groupId).get({populate: ['memberships', 'administrators']});
    }


    newGroup.$inject = ['GroupsService', 'AuthService'];

    function newGroup(GroupsService, AuthService) {
        return GroupsService.getNewGroup();
    }

})();
