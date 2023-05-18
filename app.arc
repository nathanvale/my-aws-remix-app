@app
my-aws-remix-app-d2df

@http
/*
  method any
  src server

@static

@tables
campiagn_processing
  PK *String 
  SK **String 

@tables-indexes
campiagn_processing
  GS1PK *String
  GS1SK **String
  name GSI1

campiagn_processing
  GS2PK *String
  GS2SK **String
  name GSI2  

campiagn_processing
  GS3PK *String
  GS3SK **String
  name GSI3  