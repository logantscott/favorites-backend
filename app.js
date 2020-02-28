// Load Environment Variables from the .env file
const client = require('./lib/client.js');
// Application Dependencies
const express = require('express');
// (add cors, pg, and morgan...)
const cors = require('cors');
const morgan = require('morgan');
const Request = require('superagent');

// Database Client
// (create and connect using DATABASE_URL)
client.connect();

// Application Setup
const app = express();
// (add middleware utils: logging, cors, static files from public)
// app.use(...)
//this will let us host images on our server
// app.use('/assets', express.static('assets'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

// Auth Routes
const createAuthRoutes = require('./lib/auth/create-auth-routes');

const authRoutes = createAuthRoutes({
    selectUser(email) {
        return client.query(`
            SELECT id, name, email, hash 
            FROM users
            WHERE email = $1;
        `,
        [email]
        ).then(result => result.rows[0]);
    },
    insertUser(user, hash) {
        return client.query(`
            INSERT into users (name, email, hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email;
        `,
        [user.name, user.email, hash]
        ).then(result => result.rows[0]);
    }
});

// before ensure auth, but after other middleware:
app.use('/api/auth', authRoutes);

// for every route, on every request, make sure there is a token
const ensureAuth = require('./lib/auth/ensure-auth');

app.use('/api', ensureAuth);

// API Routes
app.get('/', async(req, res, next) => {
    try {
        res.json({
            welcome: 'home'
        });
    } catch (err) {
        next(err);
    }
});

app.get('/users', async(req, res, next) => {
    try {
        const result = await client.query(`
            SELECT
                *
            FROM users
            ORDER BY id;
        `,);

        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

app.get('/api/games', async(req, res, next) => {
    try {
        console.log(`https://www.boardgameatlas.com/api/search?name=${req.query.search}&client_id=${process.env.CLIENTID}`);
        const data = await Request.get(`https://www.boardgameatlas.com/api/search?name=${req.query.search}&client_id=${process.env.CLIENTID}&limit=20`);

        res.json(data.body);

        // const result = await client.query(`
        //     SELECT
        //         *
        //     FROM todos
        //     WHERE user_id = $1
        //     ORDER BY id;
        // `,
        // [req.userId]);

        // res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

app.get('/api/favorites', async(req, res, next) => {
    try {

        const result = await client.query(`
            SELECT
                *
            FROM favorites
            WHERE user_id = $1
            ORDER BY id;
        `,
        [req.userId]);

        res.json(result.rows);

    } catch (err) {
        next(err);
    }
});

app.post('/api/favorites', async(req, res, next) => {
    try {

        const result = await client.query(`
        INSERT INTO favorites (name, url, image_url, thumb_url, min_players, max_players, min_playtime, max_playtime, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
        `,
        [req.body.name, req.body.url, req.body.image_url, req.body.thumb_url, req.body.min_players, req.body.max_players, req.body.min_playtime, req.body.max_playtime, req.userId]);

        res.json(result.rows[0]);

    } catch (err) {
        next(err);
    }
});

app.delete('/api/favorites', async(req, res, next) => {
    try {

        const result = await client.query(`
            DELETE FROM favorites
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `,
        [req.body.id, req.userId]);

        res.json(result.rows[0]);

    } catch (err) {
        next(err);
    }
});

// app.post('/api/todos', async(req, res, next) => {
//     try {
//         const result = await client.query(`
//         INSERT INTO todos (task, user_id, complete)
//         VALUES ($1, $2, false)
//         RETURNING *;
//         `,
//         [req.body.task, req.userId]);

//         res.json(result.rows[0]);
//     } catch (err) {
//         next(err);
//     }
// });

// app.put('/api/todos', async(req, res, next) => {
//     try {
//         const result = await client.query(`
//         UPDATE todos
//         SET complete = $1
//         WHERE todos.id = $2
//             AND user_id = $3
//         RETURNING *;
//         `,
//         [req.body.complete, req.body.id, req.userId]);

//         res.json(result.rows[0]);
//     } catch (err) {
//         next(err);
//     }
// });

// app.delete('/api/todos', async(req, res, next) => {
//     try {
//         const result = await client.query(`
//         DELETE FROM todos
//         WHERE todos.id = $1
//             AND user_id = $2
//         RETURNING *;
//         `,
//         [req.body.id, req.userId]);

//         res.json(result.rows[0]);
//     } catch (err) {
//         next(err);
//     }
// });

// http method and path...

module.exports = {
    app: app
};