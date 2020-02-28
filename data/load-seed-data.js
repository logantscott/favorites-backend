const client = require('../lib/client.js');

// import our seed data:
const favorites = require('./favorites.js');

run();

async function run() {

    try {
        await client.connect();

        await client.query(`
            INSERT INTO users (name, email, hash)
            VALUES ($1, $2, $3);
        `,
        ['Logan', 'email', '$2a$08$ci7QiQzRkMk1WjimolST5e9/a0Atg6InI6RxHh4l.DtaMu6vN3eV6']);

        await Promise.all(
            favorites.map(favorite => {
                return client.query(`
                    INSERT INTO favorites (name, url, image_url, thumb_url, min_players, max_players, min_playtime, max_playtime, user_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
                `,
                [favorite.name, favorite.url, favorite.image_url, favorite.thumb_url, favorite.min_players, favorite.max_players, favorite.min_playtime, favorite.max_playtime, 1]);
            })
        );

        console.log('seed data load complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
    
}