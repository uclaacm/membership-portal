# deployment

Deployment configuration for the ACM Membership Portal. For full documentation, see the [wiki](https://wiki.uclaacm.com/doc/membership-portal-zXucs8mbPS).

## Getting Started

Follow these steps to get the development environment set up after cloning the repository.

1. **Clone the repository**

```bash
git clone https://github.com/uclaacm/membership-portal.git
cd membership-portal/deployment
```

2. **Create the ENV file**

Secrets are not kept in this repository. Copy the example and fill in the values, which you can get from a dev team officer:

```bash
cd dev
cp node.env.example node.env
```

`node.env` is gitignored; never commit it.

3. **Run the development server**

```bash
# From deployment/dev:
make
```

Docker builds the images (installing dependencies) and starts all services. **Do not run `npm install` or `yarn` locally** — dependency installation happens inside the Docker container at build time.

The UI is available at `http://localhost:8000` and the backend API at `http://localhost:8080`.

## Services

| Service  | Port  | Description          |
|----------|-------|----------------------|
| UI       | 8000  | Next.js frontend     |
| Backend  | 8080  | Express API          |
| Postgres | 5432  | Primary database     |
| MongoDB  | 27017 | Secondary database   |
