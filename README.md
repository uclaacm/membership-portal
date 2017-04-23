# membership-portal 

The ACM Membership Portal


### Prerequisites

You must have either Docker or Vagrant installed and the repository cloned.  `cd` to the respository.

### Setup (Vagrant)

If you don't want to use vagrant and simply want to deploy with Docker, you can skip this section.

The Vagrantfile is setup to include all the system dependencies, including Docker. Simply run these commands and the virtual machine will be completely set up.

```bash
user@local$ vagrant up --provision
user@local$ vagrant ssh
vagrant@acm$ cd /vagrant
```

### Deploy

The very first time you deploy, you need to also run `make setup`. Subsequently, you can just run:

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
- `make reset` – completely obliterate the currently built images
- `make build` – only run the image build
- `make run` – only run in detached mode
- `make run-dev` – only run in attached mode

### Accessing the Server

If you're running Vagrant, the virtual machine is setup to forward port `8080` (host) to `80` (guest). To access the server from outside the virtual machine, run:

```Bash
$ curl http://127.0.0.1:8080/api/v1/health
```

If you're not running Vagrant, you can simply access the server through its Docker port directly (`80`)