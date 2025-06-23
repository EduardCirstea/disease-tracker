import * as pgtools from 'pgtools';

const config = {
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    password: 'postgres',
};

const databaseName = 'infectious_diseases';

pgtools.createdb(config, databaseName).then(
    () => {
        console.log(`Database ${databaseName} created successfully!`);
    },
    (error) => {
        if (error.name === 'duplicate_database') {
            console.log(`Database ${databaseName} already exists.`);
        } else {
            console.error('Error creating database:', error);
        }
    },
);
