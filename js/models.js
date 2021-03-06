export class Project {
    constructor(key, title, description, parentKey){
        this._key = key;
        this._title = title;
        this._description = description;
        this._parentKey = parentKey;
    }
}

export class List{
    constructor(key, title, parentKey) {
        this._key = key;
        this._title = title;
        this._parentKey = parentKey;
    }
}

export class Task{
    constructor(key, title, status, parentKey) {
        this._key = key;
        this._title = title;
        this._status = status;
        this._parentKey = parentKey;
    }
}

export class User{
    constructor(key, username, password) {
        this._key = key;
        this._username = username;
        this._password = password;
    }
}
