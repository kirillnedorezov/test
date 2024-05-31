const Datastore = require('nedb');

// Создаем базу данных
const db = new Datastore({ filename: 'test.db', autoload: true });

// Данные для вставки
const users = [
    { name: 'John', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 35 }
];

// Вставляем данные в базу данных
db.insert(users, (err, newDocs) => {
    if (err) {
        console.error('Error inserting data:', err);
    } else {
        console.log('Inserted data:', newDocs);
    }
});
