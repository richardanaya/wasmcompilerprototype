# aether
A programming language for web assembly
* simplicity
* inferred static typing
* can compile itself
* no null

```javascript
console_log(msg_addr,msg_len)

magic_number = 42
magic_word = "please"

square(x) {
  return x^2
}

export main(msg_start,msg_len){
  msg = string(msg_start,msg_len)
  if msg == "exit" {
    return -1
  } else if msg == "end" {
    console_log("end",3)
  } else {
    console_log("unknown",7)
  }
  a = [1,2,"wha"]
  push(a,4)
  ap = num(pop(a))
  as = string(shift(a))
  b = {who:"test"}
  c = dictionary(msg)
  cs = string(c)
  i = 0
  loop {
    if i == 5 { break }
    if i == 3 or i ==4 {
      console_log(mem_loc(msg),len(msg))
    }
    a[i] = "a"
    a.whoa = "Whoa"
    i+=1
  }
  val = string(b.who)
  console(mem_loc(val),len(val))
  return 100
}
```
