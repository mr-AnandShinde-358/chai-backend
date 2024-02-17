# HTTP crash course

## HTPX - hyper text transfer Protocol

## URL- Uniform Resource Locator

## URI- Uniform Resource Identifier

## URN- Uniform Resource Name


##
# What is HTTP headers

## metadata -> key-value,sent along with request & response

### working header ->caching, authentication, manage state(user state - gusset user,loging user, card)
    x-prefix -> 2012 (X-deprecated)

### Request Header -> from client data
### Response Header -> from server data
### Representation Header -> encoding / compression 
### Payload Header -> data 

## Most common Headers
* Accept:application/json
* user - Agent  [kisane request aayi hai postman/thunderclient /browser/ mobile browser ]
* Authorigation [Bears: jswt token___________]
* content-Type[images/pdf/video]
* cookie[{key-value} time,expriry]
* cache-control [data kab exprires karana hai 3600s]

## cores 
* Access-control-Allow-Origin
* Access-control-Allow - credentials
* Access-control-Allow -Method

## Security
-> Cross-Origin-Opener-Policy
* Cross-Origin-Embedder-Policy (COEP)
* Cross-Origin-Opener-Policy 
* content-security-Policy 
* X-XCS- Protection

# HTTP Methods
basic set of operation that can be used to interact with server

* GET : retrive a resource
* HEAD : No Message body (response headers only )
* OPTIONS : What operation are available
* TRACE : loopback test (get same data)
* DELETED : remove a resource
* PUT : replace a resource
* POST : interact with resource (mostly add)
* PATCH : change part of a resource 


# HTTP Status code 
* 1XX Informational
* 2XX Success
* 3XX Redirection
* 4XX Client error
* 5XX Server error

* mostly use production status code
  -  100 Continue
  -  102 Processing
  - 200 ok 
  - 201 created
  - 202 accepted
  - 307 temporory redirect
  - 308 parment redirect
  - 400 Bad request
  - 401 Unauthorized
  - 402 Payment required
  - 404 Not Found
  - 500 Internal Server Error
  - 504 Gateway Timeout error

