export class Project {
    constructor(title, description){
        this._title = title;
        this._description = description;
    }

    getTitle(){
        return this._title;
    }

    getDescription(){
        return this._description;
    }
}

class List{}

class Task{}