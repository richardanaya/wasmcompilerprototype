let _memory = [];

//built-in functions
function string(i,len){
  if(typeof i == "object"){
    return JSON.stringify(i)
  }
  let s = "";
  for(let j=i;j<i+len;j++){
    s = s + String.fromCharCode(_memory[j]);
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

function number(n){
  if(typeof n == "string"){
    return n.charCodeAt(0)
  }
  return n
}

function mem_set_i32(i,n){
  _memory[i+0] = 0;
  _memory[i+1] = 0;
  _memory[i+2] = 0;
  _memory[i+3] = n;
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

function array(s){
  if(typeof s == "string") { return JSON.parse(s)};
  return s;
}

function len(v){
  return v.length
}

// compiler code
CHAR_SPACE = " "
CHAR_NEWLINE = "\n"
CHAR_PAREN = "("
CHAR_PAREN_END = ")"
CHAR_CURLY_PAREN = "{"
CHAR_CURLY_PAREN_END = "}"
CHAR_BRACKET = "["
CHAR_BRACKET_END = "]"
CHAR_1 = "1"
CHAR_2 = "2"
CHAR_3 = "3"
CHAR_4 = "4"
CHAR_5 = "5"
CHAR_6 = "6"
CHAR_7 = "7"
CHAR_8 = "8"
CHAR_9 = "9"
CHAR_0 = "0"

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
      append(symbols,{type:"symbol",value:c})
      new_symbol = true
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
          sym.value = sym.value + c
        } else {
          error = "error invalid number:" + sym.value + c
          break
        }
      } else {
          sym.value = sym.value + c
      }
    }
    i = i + 1;
  }
  return {symbols:symbols,error:error}
}

function parse_return(symbols,i){
  let statement = {type:"return"}
  error = ""

  while(true){
    sym = symbols[i]
    if(i == len(symbols)){
      error = "unexpected end of file"
      break
    } else if(sym.type =="number"){
      statement.value = {type:"number",value:sym.value}
      break
    }
    i = i + 1
  }

  return {statement:statement,error:error,next:i}
}

function parse_statements(symbols,i){
  let statements = []
  error = ""

  while(true){
    sym = symbols[i]
    params_started = 0
    if(i == len(symbols)){
      error = "unexpected end of file"
      break
    } else if(sym.type =="identifier" && sym.value == "return"){
      parse_result = parse_return(symbols,i)
      if(! is_empty(parse_result.error)){
        error = parse_result.error
        break
      }
      append(statements,parse_result.statement)
      i = parse_result.next+1
      break
    } else if(sym.type =="symbol" && sym.value == "}"){
      break
    }
    i = i + 1
  }

  return {statements:statements,error:error,next:i}
}

function parse_function(symbols,i){
  let ast = {type:"function", name:"",result:"number",imported:0,exported:0,statements:[]}
  error = ""
  params_started = 0
  while(true){
    sym = symbols[i]
    if(i == len(symbols)){
      error = "unexpected end of file"
      break
    } else if(sym.type =="identifier" && sym.value == "export"){
      ast.exported = 1
    } else if(is_empty(ast.name) && sym.type =="identifier"){
      ast.name = sym.value
    } else if(!is_empty(ast.name) && params_started == 0 && sym.type =="symbol" && sym.value == "("){
      //do nothing
      params_started = 1
    } else if(!is_empty(ast.name) && params_started == 1 && sym.type =="symbol" && sym.value == ")"){
      if(i+1==len(symbols)){
        ast.imported = 1
        break;
      } else {
          next_sym = dictionary(symbols[i+1])
          if(next_sym.type == "symbol" || next_sym.value == "{"){
            parse_result = parse_statements(symbols,i)
            if(! is_empty(parse_result.error)){
              error = parse_result.error
              break
            }
            ast.statements = parse_result.statements
            i = parse_result.next
            break
          } else {
            ast.imported = 1
            break;
          }
      }
    } else {
      error = "unknown identifier in function def: "+string(sym)
      break
    }
    i = i + 1
  }

  return {function:ast,error:error,next:i}
}

function parse(symbols){
  let ast = []
  error = ""
  i = 0
  while(true){
    if(i==len(symbols)){break}
    sym = symbols[i]
    if(sym.type =="identifier"){
      parse_result = parse_function(symbols,i)
      if(! is_empty(parse_result.error)){
        error = parse_result.error
        break
      }
      console.log(ast)
      append(ast,parse_result.function)
      i = parse_result.next
    } else {
      error = "unknown identifier: "+string(sym)
      break
    }
    i = i + 1;
  }
  return {ast:ast,error:error}
}

function compile_ast(ast){
  let module = [];
  let section_types = {section:"types", types:[
    {params:[], return: [TYPE_I32]}
  ]}
  append(module,section_types)
  let section_functions = {section:"functions", functions:[0]}
  append(module,section_functions)
  let section_memory = {section:"memory", min:10}
  append(module,section_memory)
  let section_exports = {section:"exports", exports:[
    {name:"main",kind:KIND_FUNCTION,index:0},
    {name:"memory",kind:KIND_MEMORY,index:0}
  ]}
  append(module,section_exports)
  let section_code = {section:"code", code:[
    {
      locals:[],
      code:[
        I32_CONST, 42
      ]
    }
  ]}
  append(module,section_code)
  return module
}

SECTION_TYPES = 1
SECTION_FUNCTIONS = 3
SECTION_MEMORY = 5
SECTION_EXPORTS = 7
SECTION_CODE = 10

FUNCTION_TYPE = 96 //0x60
TYPE_I32 = 127 // 0x7F
TYPE_I64 = 126 // 0x7E
TYPE_F32 = 125 // 0x7D
TYPE_F64 = 124 // 0x7C

EXPRESSION_END = 11 //0x0B

I32_CONST = 65 //0x41

KIND_FUNCTION = 0
KIND_MEMORY = 2

function appendUnsignedInteger(maxBits,bytes,value){
  if(value<128){
      append(bytes,value)
      return
  }
  throw "handle higher unsigned values"
}

function appendSignedInteger(maxBits,bytes,value){
  if(value<64){
      append(bytes,value)
      return
  }
  throw "handle higher signed values"
}

function appendUninterpretedInteger(maxBits,bytes,value){
  appendSignedInteger(maxBits,bytes,value)
}

function appendStringToBytes(dest,s){
  let j = 0
  while(true){
    if(j == len(s)){break}
    append(dest,number(s[j]))
    j = j+1
  }
}

function appendBytes(dest,bytes){
  let j = 0
  while(true){
    if(j == len(bytes)){break}
    append(dest,number(bytes[j]))
    j = j+1
  }
}

function compile_wasm(wasm){
  let bytes = []
  //add magic numbers
  append(bytes,0)
  append(bytes,97)
  append(bytes,115)
  append(bytes,109)
  append(bytes,1)
  append(bytes,0)
  append(bytes,0)
  append(bytes,0)

  let i = 0
  while(true){
    if(i == len(wasm)){
      break
    }
    section = dictionary(wasm[i])
    console.log(section)

    if(section.section == "types"){
      let types_bytes = []
      appendUnsignedInteger(32,types_bytes,len(section.types))
      j = 0
      while(true){
        if(j == len(section.types)){break}
        type = dictionary(section.types[j])
        append(types_bytes,FUNCTION_TYPE)
        appendUnsignedInteger(32,types_bytes,len(type.params))
        appendBytes(types_bytes,type.params)
        appendUnsignedInteger(32,types_bytes,len(type.return))
        appendBytes(types_bytes,type.return)
        j = j+1
      }
      append(bytes,SECTION_TYPES)
      appendUnsignedInteger(32,bytes,len(types_bytes))
      appendBytes(bytes,types_bytes)
    }


    if(section.section == "functions"){
      let function_bytes = []
      appendUnsignedInteger(32,function_bytes,len(section.functions))
      j = 0
      while(true){
        if(j == len(section.functions)){break}
        appendUnsignedInteger(32,function_bytes,number(section.functions[j]))
        j = j+1
      }
      append(bytes,SECTION_FUNCTIONS)
      appendUnsignedInteger(32,bytes,len(function_bytes))
      appendBytes(bytes,function_bytes)
    }

    if(section.section == "memory"){
      let memory_bytes = []
      append(memory_bytes,1)
      append(memory_bytes,0)
      append(memory_bytes,section.min)
      append(bytes,SECTION_MEMORY)
      appendUnsignedInteger(32,bytes,len(memory_bytes))
      appendBytes(bytes,memory_bytes)
    }

    if(section.section == "exports"){
      let exports_bytes = []
      appendUnsignedInteger(32,exports_bytes,len(section.exports))
      j = 0
      while(true){
        if(j == len(section.exports)){break}
        let e = dictionary(section.exports[j])
        export_bytes = []
        appendUnsignedInteger(32,export_bytes,len(e.name))
        appendStringToBytes(export_bytes,e.name)
        append(export_bytes,e.kind)
        appendUnsignedInteger(32,export_bytes,e.index)
        appendBytes(exports_bytes,export_bytes)
        j = j+1
      }
      append(bytes,SECTION_EXPORTS)
      appendUnsignedInteger(32,bytes,len(exports_bytes))
      appendBytes(bytes,exports_bytes)
    }

    if(section.section == "code"){
      let codes_bytes = []
      appendUnsignedInteger(32,codes_bytes,len(section.code))
      j = 0
      while(true){
        if(j == len(section.code)){break}
        let c = dictionary(section.code[j])
        code_bytes = []
        appendUnsignedInteger(32,code_bytes,len(c.locals))
        k = 0
        while(true){
          if(k == len(c.locals)){break}
          //appendUnsignedInteger(32,function_bytes,number(section.functions[j]))
          k = k+1
        }
        k = 0
        while(true){
          if(k == len(c.code)){break}
          op = c.code[k]
          if(op == I32_CONST){
            append(code_bytes,op)
            appendUninterpretedInteger(32,code_bytes,c.code[k+1])
            k = k+1
          }
          k = k+1
        }
        append(code_bytes,EXPRESSION_END)
        appendUnsignedInteger(32,codes_bytes,len(code_bytes))
        appendBytes(codes_bytes,code_bytes)
        j = j+1
      }
      append(bytes,SECTION_CODE)
      appendUnsignedInteger(32,bytes,len(codes_bytes))
      appendBytes(bytes,codes_bytes)
    }

    i = i+1
  }
  return bytes
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
  parse_result = parse(symbols)
  if(! is_empty(parse_result.error)){
    console.log(parse_result.error)
    return
  }
  ast = parse_result.ast
  console.log(string(ast))
  wasm = compile_ast(ast)
  console.log(string(wasm))
  let wasmBytes = compile_wasm(wasm)
  console.log(wasmBytes)
  wasmResponse = mem_alloc(4+len(wasmBytes))
  mem_set_i32(wasmResponse,len(wasmBytes))
  j = 0
  while(true) {
    if(j == len(wasmBytes)){
      break;
    }
    mem_set(wasmResponse+4+j,wasmBytes[j])
    j = j + 1
  }
  return 0
}

//client example
var fs = require("fs");
var contents = fs.readFileSync(process.argv[2], "utf8");
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
