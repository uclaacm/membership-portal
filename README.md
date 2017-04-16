# membership-portal 

The ACM Membership Portal


### Prerequisites

You must have either Docker or Vagrant installed and the repository cloned.  `cd` to the respository.

### Setup (Vagrant)

If you don't want to use vagrant and simply want to deploy with Docker, you can skip this section.

The Vagrantfile is setup to include all the system dependencies, including Docker. Simply run these commands and the virtual machine will be completely set up.

```bash
$ vagrant up --provision
$ vagrant ssh
$ cd /vagrant
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
- `make reset` – completely obliterate the currently build images
- `make build` – only run the image build
- `make run` – only run in detached mode
- `make run-dev` – only run in attached mode