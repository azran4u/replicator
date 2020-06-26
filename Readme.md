## Info

POC to demonstrate geo entities with geo queries based on postgis

## How to run the code

if you haven't done so yet - install git, nodejs, npm in your computer.

clone the repo

```bash
git clone https://gitlab.com/ofek324/maam/tosh-core/geo-poc
cd geo-poc
```

create .env file in the geo-poc folder
this file keeps all the enviornment varaibles to run the project.
add the following content:

```env
POSTGRES_USERNAME=ask_eyal
POSTGRES_PASS=ask_eyal
POSTGRES_PORT=5432
POSTGRES_HOST=ask_eyal
POSTGRES_DATABASE=ask_eyal
DB_MAX_CLIENTS=20
DB_IDLE_TIMEOUT_MS=30000
```

run the following commands in the console in the project's folder:
```bash
npm install
npm start
```

