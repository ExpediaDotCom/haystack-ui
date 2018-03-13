/*
 * Copyright 2018 Expedia, Inc.
 *
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */

import { action, observable } from 'mobx';

export class UserStore {
    @observable user;

    constructor() {
        this.user = {
            id: null,
            name: null,
            groups: null,
            isLoggedIn: false
        };
    }

    @action setUser(userData) {
        this.user.id = userData.id;
        this.user.name = userData.userName;
        this.user.groups = userData.userGroups;
        this.user.isLoggedIn = true;
    }

    @action clearUser() {
        this.user.id = null;
        this.user.name = null;
        this.user.groups = null;
        this.user.isLoggedIn = false;
    }
}

const uiStore = new UserStore();

export default uiStore;
