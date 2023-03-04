# membership-portal 

The ACM Membership Portal repo contains the backend for the ACM Membership Portal website.

### Overview
This repo uses the following main technologies:
* ExpressJS
* Postgres
* GoogleAuth
* Docker (for development)
* Jest (for testing)

The backend source code can be found in the 'app' directory.
The routes for the backend are found in 'app/api/v1'.
The unit tests can be found in the 'tests' directory.

### Prerequisites
To run this repo for development or testing, you need to have Docker installed.

### Development
Development mode is where you should code and test new features.
In development mode, a docker container for the database and the backend API are created and ran.
Any saved changes to a file will automatically recompile the server code.

To run in development:
```Bash
$ make
```

### Testing

To run unit tests:
```Bash
$ make test
```
This command will create and run the database and run all the unit tests.

### Accessing the Server

The server runs on port `8080`.

You can test that the server is running by going to `http://localhost:8080/api/v1/health`.
If the server is running on a computer that is not your development computer, the address will be `http:<IP ADDRESS>:8080/api/v1/health`,
where IP ADDRESS is the address of the server.