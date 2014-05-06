---
layout: documentation
title: Hombit API Specification v0.1
---

About the Hombit HTTP Server
----------------------------
The Hombit has a rather limited HTTP server. It kinda speaks HTTP 1.1 and sports the following fabulous features:

* Requests:
	* Methods: GET, PUT, POST, DELETE
* Response:
	* Status codes
	* Content types: text/html and application/json

It does NOT support:

* Any other headers than those specified above
* Content encoding
* Connection keep-alive
* Gzip compression or other fancy features

Conventions
-----------
Throughout the API, some conventions are followed:

#### Minimal responses
Simple REST endpoints will return only an HTTP status code. 
Endpoints that convey a bit more meaty information do so JSON-formatted.

