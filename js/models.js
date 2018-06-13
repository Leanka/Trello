export class Project {
    constructor(title, description){
        this._title = title;
        this._description = description;
    }

    get title(){
        return this._title;
    }

    get discription(){
        return this._description;
    }
}

export class List{
    constructor(id, title) {
        this._id = id;
        this._title = title;
    }

    get id() {
        return this._id;
    }

    get title() {
        return this._title;
    }
}

export class Task{
    constructor(id, title) {
       this._id = id;
       this._title = title;
    }

    get id() {
        return this._id;
    }

    get title() {
        return this._title;
    }
}