class MyError extends Error{
    constructor(status,message){
        super();
        this.stack=status;
        this.message=message;
        
    }
}

module.exports = MyError;