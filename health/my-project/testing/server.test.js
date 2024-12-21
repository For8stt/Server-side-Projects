const assert = require('assert');
const request = require('supertest');
const mysql = require('mysql2');

const baseUrl = 'http://monitor-siet.app:8080';
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '090705jk',
//     database: 'fitness_db',
// });
const connection = mysql.createConnection({
        host: 'monitor-siet.db',
        user: 'root',
        password: '090705jk',
        database: 'fitness_db',
        port: 3306,
});

const checkIfUserExists = (userId) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users WHERE id = ?', [userId], (error, results) => {
            if (error) return reject(error);
            resolve(results.length > 0);
        });
    });
};

const createUser = (userId, name, email) => {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO users (id, name, email) VALUES (?, ?, ?)', [userId, name, email], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

const deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM users WHERE id = ?', [userId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

describe('API Tests for Characteristics', function () {
    const userId = 1;
    let create=false;

    before(async function() {
        const userExists = await checkIfUserExists(userId);
        if (!userExists) {
            create=true
            await createUser(userId, 'User Name', 'user@example.com');
        }
    });

    after(async function() {
        if (create) {
            await deleteUser(userId);
        }
    });

    it('should add a characteristic', async function () {
        const response = await request(baseUrl)
            .post('/addCharacteristic')
            .send({
                user_id: userId,
                datum: '2024-11-30',
                value: 80,
                method: 'manual',
                characteristic_type: 'vaha'
            })
            .set('Content-Type', 'application/json');

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.message, 'Characteristic added successfully!');
    });
});
