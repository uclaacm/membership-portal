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

### Internship Test Data
The normal dev setup seeds Postgres users, committees, and events, but internship applications live in MongoDB and are not seeded automatically.

To create or refresh internship testing data for a local member account:
```Bash
$ SEED_EMAIL=myusername@g.ucla.edu SEED_STATUS=draft make seed-internship-test-data
```

Useful overrides:
* `SEED_EMAIL` - Postgres user email to seed for.
* `SEED_USER_UUID` - Postgres user UUID to seed for. Use this if you already know the database UUID.
* `SEED_STATUS` - `draft` or `submitted`.
* `SEED_COMMITTEES` - Comma-separated committee names, default `Hack,AI,Design`.
* `SEED_APPLICATION_CYCLE` - Target application cycle, default current cycle.

If you do not pass `SEED_EMAIL` or `SEED_USER_UUID`, the script will fail instead of silently seeding a different user.

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