var Lexer = require('./json-stream').Lexer
var EventEmitter = require('events').EventEmitter
    stream = new EventEmitter()


var lexer = new Lexer(stream)

lexer.on('token', function(token){
    console.log(token)
})

var myObject = {
    test: {
        someprop: false,
        anotherprop: 'another value'
    },
    something: .2,
    "let's have a null property also" : null
}

var str = JSON.stringify(myObject)
console.log(str)

var str1 = str.substr(0, 10)
var str2 = str.substr(10, str.length-10)


stream.emit('data', str1)
stream.emit('data', str2)

