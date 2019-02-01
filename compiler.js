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
  JSON.stringify(s);
}

function len(v){
  return v.length
}

// compiler code
function parse(file){
  ast = []
  main_function = {
    type: "function",
    name: "main",
    expored: 1,
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
  ast = parse(file)
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
