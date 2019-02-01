let _memory = [];

//built-in functions
function string(i,len){
  if(typeof i == "object"){
    return JSON.stringify(i)
  }
  let s = "";
  for(let j=i;j<i+len;j++){
    s += String.fromCharCode(_memory[j]);
  }
  return s;
}

function is_empty(v){
  if(Array.isArray(v)){
    return v.length == 0;
  } else if(typeof v == "object"){
    return v.keys().length == 0;
  } else {
    return v == 0;
  }
}

function mem_alloc(i){
  return 0;
}

function mem_free(i){

}

function mem_set_i32(i,n){
  _memory[i+0] = 0;
  _memory[i+1] = 0;
  _memory[i+2] = 0;
  _memory[i+3] = 1;
}

function mem_set(i,n){
  _memory[i+0] = n;
}

function append(ast,item){
  ast.push(item);
  return ast;
}

function dictionary(s){
  if(typeof s == "string") { return JSON.parse(s)};
  return s;
}

function len(v){
  return v.length
}

// compiler code
CHAR_SPACE = ' '
CHAR_NEWLINE = '\n'
CHAR_PAREN = '('
CHAR_PAREN_END = ')'
CHAR_CURLY_PAREN = '{'
CHAR_CURLY_PAREN_END = '}'
CHAR_BRACKET = '['
CHAR_BRACKET_END = ']'
CHAR_1 = '1'
CHAR_2 = '2'
CHAR_3 = '3'
CHAR_4 = '4'
CHAR_5 = '5'
CHAR_6 = '6'
CHAR_7 = '7'
CHAR_8 = '8'
CHAR_9 = '9'
CHAR_0 = '0'

function lex(file){
  symbols = []
  i = 0
  l = len(file)
  new_symbol = true
  error = ""
  while(true) {
    if(i == l) { break }
    c = file[i]
    if(c == CHAR_SPACE || c == CHAR_NEWLINE){
      if(new_symbol != true){
        new_symbol = true;
      }
    } else if(c == CHAR_PAREN || c == CHAR_PAREN_END || c == CHAR_CURLY_PAREN || c == CHAR_CURLY_PAREN_END || c == CHAR_BRACKET || c == CHAR_BRACKET_END){
      if(new_symbol == true){
        append(symbols,{type:"symbol",value:c})
      }
    } else {
      if(new_symbol == true){
        append(symbols,{type:"identifier",value:""})
        new_symbol = false;
      }
      sym = dictionary(symbols[len(symbols)-1])
      if(sym.value == "" && c == CHAR_1 || c == CHAR_2 || c == CHAR_3 || c == CHAR_4 || c == CHAR_5 || c == CHAR_6 || c == CHAR_7 || c == CHAR_8 || c == CHAR_9 || c == CHAR_0 ){
        sym.type = "number"
      }
      if(sym.type == "number"){
        if(c == CHAR_1 || c == CHAR_2 || c == CHAR_3 || c == CHAR_4 || c == CHAR_5 || c == CHAR_6 || c == CHAR_7 || c == CHAR_8 || c == CHAR_9 || c == CHAR_0 ){
          sym.value += c
        } else {
          error = "error invalid number:" + sym.value + c
          break
        }
      } else {
          sym.value += c
      }
    }
    i++;
  }
  return {symbols:symbols,error:error}
}

function parse(symbols){
  ast = []
  main_function = {
    type: "function",
    name: "main",
    exported: 1,
    return_type: "number",
    body: [
        {
          type: "return",
          value: {
            type: "number",
            value: 42
          }
        }
    ]
  }
  append(ast,main_function)
  return ast
}

function compile_ast(ast){
  return [42]
}

//exported
function file(len){
  return mem_alloc(len)
}

function compile(code_offset,code_len) {
  file = string(code_offset,code_len)
  lex_result = lex(file)
  if(! is_empty(lex_result.error)){
    console.log(lex_result.error)
    return
  }
  symbols = lex_result.symbols
  console.log(symbols)
  ast = parse(symbols)
  wasm = compile_ast(ast)
  console.log(string(ast))
  wasmResponse = mem_alloc(1+len(wasm))
  mem_set_i32(wasmResponse,1)
  j = 0
  while(true) {
    if(j == len(wasm)){
      break;
    }
    mem_set(wasmResponse+4+j,wasm[j])
    j += 1
  }
  return 0
}

//client example
var fs = require('fs');
var contents = fs.readFileSync(process.argv[2], 'utf8');
let start = file(contents.length);
for(let i=0;i<contents.length;i++){
  _memory[i] = contents.charCodeAt(i)
}
let wasmStart = compile(start,contents.length);
var output = process.argv[2].replace(".a",".wasm");
let byteLength = _memory[wasmStart+0] << 24 | _memory[wasmStart+1] << 16 | _memory[wasmStart+2] << 8 | _memory[wasmStart+3];
let wasmBytes = [];
for(let i=0;i<byteLength;i++){
  wasmBytes[i] = _memory[i+4]
}
console.log(byteLength);
console.log(wasmBytes);
fs.writeFileSync(output,Buffer.from(wasmBytes))
