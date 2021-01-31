# COVID-19 Tracker in Kuwait

### Description

This project displays information about COVID-19 cases in Kuwait. All the data were taken from the official instagram account of [Ministry of Health](https://www.instagram.com/kuwait_moh/).

This project was built to put the knowledge I learned about d3.js library and pure node.js server into practice, and it is not production ready but feel free to fork it, explore it and play with it.

### Prereqisites

- Node JS
- MySQL

### Setup

1. Start up MySQL server
2. Create a database (or you can use an existing one if that's what you prefer)
3. Create `.env.local` file in the root directory of this project
4. Substitute the appropriate values:

```
NODE_ENV=development

HOST=<host-name>
PORT=<port-number>

DB_HOST=<mysql-host>
DB_USER=<mysql-username>
DB_PASS=<mysql-password>
DB_NAME=<database-name>
```

5. In the terminal, run: `npm run dev`
6. Now the server is up and the website can be accessed by this url `http://<host-name>:<port-number>/`


Enjoy :)