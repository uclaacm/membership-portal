# membership-portal 

The ACM Membership Portal


### Prerequisites

You must have Node.js >=6.9.0 <=6.9.2, Redis, and PostgreSQL installed.

### Setup

Make sure the postgres server is running. To configure your environment, run:

```Bash
$ npm run dev-setup
```

In another window, make sure the redis server is running

```Bash
$ redis-server
```



### Installation

Installing the website by cloning this repository and running:

```shell
$ npm install
```
Then start the website:

```Bash
$ npm start
```



### Notes

- Everytime you pull from the repository, make sure to run `npm install` incase any of the dependencies have changed.
- Redis is an **in-memory database**. If you shutdown your computer or kill the redis server, sessions will not persist. If you need to shut down your computer or restart the redis server *and* want the data in the database to be restored the next time, make sure to run the command `redis-cli shutdown` to safely shutdown the server.
