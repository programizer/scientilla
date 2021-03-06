(function () {
    angular
            .module('users')
            .controller('UserBrowsingController', UserBrowsingController);

    UserBrowsingController.$inject = [
        'UsersService',
        'Notification',
        'AuthService',
        'ModalService',
        '$location'
    ];

    function UserBrowsingController(UsersService, Notification, AuthService, ModalService, $location) {
        var vm = this;

        vm.user = AuthService.user;
        vm.viewUser = viewUser;
        vm.deleteUser = deleteUser;
        vm.editUser = editUser;
        vm.createNew = createNew;

        vm.getData = getUsers;
        vm.onFilter = refreshList;

        vm.searchForm = {
            name: {
                inputType: 'text',
                label: 'Name',
                matchColumn: 'name',
                matchRule: 'contains'
            },
            surname: {
                inputType: 'text',
                label: 'Surname',
                matchColumn: 'surname',
                matchRule: 'contains'
            }
        };

        function getUsers(q) {
            return UsersService.getUsers(q);
        }

        function refreshList(users) {
            vm.users = users;
            return vm.users;
        }

        function createNew() {
            openUserForm();
        }

        function viewUser(user) {
            $location.path('/users/' + user.id);
        }

        function editUser(user) {
            openUserForm(user);
        }

        function deleteUser(user) {
            user
                    .remove()
                    .then(function () {
                        Notification.success("User deleted");

                        getUsers()
                                .then(refreshList);

                    })
                    .catch(function () {
                        Notification.warning("Failed to delete user");
                    });

        }

        // private
        function openUserForm(user) {
            ModalService
                    .openScientillaUserForm(!user ? UsersService.getNewUser() : user.clone())
                    .then(function () {
                        return getUsers();
                    })
                    .then(refreshList);
        }

    }
})();