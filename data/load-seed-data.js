const client = require('../lib/client.js');

// import our seed data:
const todos = require('./todos');

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
            todos.map(todo => {
                return client.query(`
                    INSERT INTO todos (task, complete, user_id)
                    VALUES ($1, $2, $3);
                `,
                [todo.task, todo.complete, todo.user_id]);
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