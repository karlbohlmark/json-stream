var Lexer = function(stream){
    this.stream = stream
    this.pos = 0
    this.length = 0
    this.listeners = {token:[]}
    this.buffer = ''
    this.currentToken = ''
    this.currentTokenStart = 0
    this.currentTokenIndex = 0
    this['false'] = ['f', 'a', 'l', 's', 'e']
    this['true'] = ['t', 'r', 'u', 'e']
    this['null'] = ['n', 'u', 'l', 'l']
    this.state = 'start'
    var self = this

    this.stream.on('data', function(data){
        self.buffer += data
        self.length += data.length
        self.parseToken(data, 0)
    })
}

Lexer.prototype.parseString = function(data, i){
    while(data[i]!=="\"" && i<data.length){
        i++
        this.pos++
    }

    if(data[i]==="\""){
        i++ && this.pos++
        this.emit({type:'string', 
            value: this.buffer.substr(this.currentTokenStart, this.pos - 1 - this.currentTokenStart)})
        this.currentTokenStart = this.pos
        if(i<data.length){
            this.parseToken(data, i)
        }
    }else{
        //console.log("no more data, but string is not done")
    }
}

Lexer.prototype.parseToken = function(data, i){
    var length = data.length
        , code
    ;
    if(this.state === 'string')
    {
        return this.parseString(data, i)
    }
    if(this.state === 'number')
    {
        return this.parseNumber(data, i)
    }
    
    if(this.state === 'false'){
        return this.parseConstant('false', false, data, i)
    }
    
    if(this.state === 'true'){
        return this.parseConstant('true', true, data, i)
    }
    if(this.state === 'null'){
        return this.parseConstant('null', null, data, i)
    }
    
    var chr = data[i]
    if(chr==='{'){
        ++i && this.pos++
        this.emit({type:'openbrace'})
    }else if(chr==='}'){
        ++i && this.pos++
        this.emit({type:'closebrace'})
    }else if(chr===':'){
        ++i && this.pos++
        this.emit({type:'colon'})
    }else if(chr==="\""){
        ++i && this.pos++
        this.currentTokenStart = this.pos
        this.state = 'string'
        if(i<length){
            return this.parseString(data, i)
        }
    }else if(chr===","){
        ++i && this.pos++
        this.emit({type:'comma'})
    }else if((code=chr.charCodeAt(0)) && code>47 && code<58){
        this.state = 'number'
        this.currentTokenStart = this.pos
        return this.parseNumber(data, i)
    }else if(chr==='f'){
        this.state = 'false'
        this.currentTokenIndex = 0
        return this.parseConstant('false', false, data, i)
    }else if(chr==='t'){
        this.state = 'true'
        this.currentTokenIndex = 0
        return this.parseConstant('true', true, data, i)
    }else if(chr==='n'){
        this.state = 'null'
        this.currentTokenIndex = 0
        return this.parseConstant('null', null, data, i)
    }
    else{
        throw "Don't know how to process the character: " + chr + " right now"
    }

    if(i<length){
        //console.log('more data to parse, recursing parseToken')
        this.parseToken(data, i)
    }
}

Lexer.prototype.parseConstant = function(constant, value, data, i){
    var length = data.length,
        c = this[constant],
        clength = c.length
    while(this.currentTokenIndex<clength && i<length){
        if(data[i] !==  c[this.currentTokenIndex]){
            throw "Expected " + c[this.currentTokenIndex] + " but got " + data[i]
        }
        ++i && this.pos++
        this.currentTokenIndex++
    }

    if(this.currentTokenIndex===clength){
        this.emit({type: constant, value:value})
    }else{
    }

    if(i<length)
        this.parseToken(data, i)
}

Lexer.prototype.parseNumber = function(data, i){
    var chrCode, length = data.length
    while(i<length && (chrCode=data.charCodeAt(i)) && (chrCode>47 && chrCode < 58) || chrCode ===46){
        i++
        this.pos++
    }
    var num = this.buffer.substr(this.currentTokenStart, this.pos-this.currentTokenStart)

    this.emit({ type: 'number', value: parseFloat(num)})
    if(i<length)
        this.parseToken(data, i)
}

Lexer.prototype.emit = function(token){
    this.state = undefined
    this.lastType = token.type
    var handlers = this.listeners['token']
    for(var i=0;i<handlers.length;i++){
        handlers[i](token)
    }
}

Lexer.prototype.on = function(ev, handler){
    this.listeners[ev].push(handler)
}


exports.Lexer = Lexer
