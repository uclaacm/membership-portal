# membership-portal 

The ACM Membership Portal


### Prerequisites

You must have either Docker or Vagrant installed and the repository cloned.  `cd` to the respository. Initialize and download the static (frontend) submobule:

```bash
user@local:~$ cd membership-portal
user@local:~/membership-portal$ make update
```

### Setup (Vagrant)

If you don't want to use vagrant and simply want to deploy with Docker, you can skip this section.

The Vagrantfile is setup to include all the system dependencies, including Docker. Simply run these commands and the virtual machine will be completely set up.

```bash
user@local:~/membership-portal$ vagrant up --provision
user@local:~/membership-portal$ vagrant ssh
vagrant@acm:~$ cd /vagrant
```

### Setup (App)

The very first time you deploy, you need to set up the environment:

```bash
$ make
```

You also need to decrypt the environment variables and SSL certificates (a password is required):

```bash
$ make certs
$ make env
```

### Deploy

To deploy:

```Bash
$ make
```

To stop all services (including the databases):

```Bash
$ make stop
```

To run in development mode:

```Bash
$ make dev
```

The following commands are also available:

- `make logs` – attach to the standard output of the process and view the logs
- `make nginx-logs` - attach to the nginx server and view access log
- `make psql` - attach to the database and run queries
- `make reset` – completely obliterate the currently built images
- `make build` – only run the image build
- `make run` – only run in detached mode
- `make run-dev` – only run in attached mode

### Accessing the Server

The nginx server runs on port `80`, and all API routes can be accessed through nginx by prepending `/app` to API URLs (e.g. `/app/api/v1/auth/login` and `/app/api/v1/user`).