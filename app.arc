@app
my-aws-remix-app-d2df

@http
/*
  method any
  src server
get /test

@static

@tables
user
  pk *String

password
  pk *String # userId

note
  pk *String  # userId
  sk **String # noteId