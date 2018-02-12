# membership-portal 

The ACM Membership Portal


### Prerequisites

You must have either Docker or Vagrant installed and the repository cloned.

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
$ make setup
```

### Development

To run in development:

```Bash
$ make
```

This command will create and up the database in addition to the backend API.

### Accessing the Server

The server runs on port `8080`.
