let _memory = [];


function string(i,len){

}

function malloc(len){
    return 0;
}

function compile(i,len) {
  let file = string(i,len)
  _memory[0] = 0;
  _memory[1] = 0;
  _memory[2] = 0;
  _memory[3] = 1;
  _memory[4] = 42;
  return 0;
}

var fs = require('fs');
var contents = fs.readFileSync(process.argv[2], 'utf8');
let start = malloc(contents.length);
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
