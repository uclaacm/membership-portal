# membership-portal 

The ACM Membership Portal


### Prerequisites

You must have either [Docker CE](https://docs.docker.com/install/) or [Vagrant](https://www.vagrantup.com/downloads.html) and [VirtualBox](https://www.virtualbox.org/wiki/Downloads) installed and the repository cloned. You must also have [yarn](https://yarnpkg.com/en/) installed.


### Setup (Vagrant)

If you don't want to use vagrant and simply want to deploy with Docker, you can skip this section.

The Vagrantfile is setup to include all the system dependencies, including Docker. Simply run these commands and the virtual machine will be completely set up.

```bash
user@local:~/membership-portal$ vagrant up --provision
user@local:~/membership-portal$ vagrant ssh
vagrant@acm:~$ cd /vagrant
```

### Setup (App)

The very first time you clone, you need to set up the environment:

```bash
$ make setup
```

You also need to install the repo:

```bash
$ yarn
```

### Development

To run in development:

```Bash
$ make
```

This command will create and up the database in addition to the backend API. If you made changes to the source code, you need to quit the running instance and re-run this command

### Accessing the Server

The server runs on port `8080`.

### Committing to this repository

When you try to commit, the repo is set up to automatically check whether the build succeeds and lints the repo. The linter will try to fix as many errors as possible, but it may not be able to fix them all. You'll need to make sure the linting passes before you can commit.

### Pushing to production

To push to production, you need to have the `aws-cli` installed. You also need to run `aws configure` and enter your AWS login credentials here. See the dev team director for this information. You only have to do this once. 

Then, run `make push` to update the backend image in ECR. To deploy this, you need to go to the `membership-portal-deployments` directory and follow the instructions there.

