const client = require('../lib/client.js');

// async/await needs to run in a function
run();

async function run() {

    try {
        // initiate connecting to db
        await client.connect();

        // run a query to create tables
        await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(256) NULL,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );           
                CREATE TABLE favorites (
                    id SERIAL PRIMARY KEY NOT NULL,
                    name VARCHAR(256) NOT NULL,
                    url VARCHAR(256) NOT NULL,
                    image_url VARCHAR(256) NOT NULL,
                    external_id VARCHAR(256) NOT NULL,
                    min_players INTEGER NOT NULL,
                    max_players INTEGER NOT NULL,
                    min_playtime INTEGER NOT NULL,
                    max_playtime INTEGER NOT NULL,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    unique (user_id, external_id)
            );
        `);

        console.log('create tables complete');
    }
    catch (err) {
        // problem? let's see the error...
        console.log(err);
    }
    finally {
        // success or failure, need to close the db connection
        client.end();
    }

}