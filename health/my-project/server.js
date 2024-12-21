//Yulian Kisil id:128371
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage });
const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'client/build')));


// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '090705jk',
//     database: 'fitness_db',
//     port: 3306,
// });
const db = mysql.createConnection({
    host: 'monitor-siet.db',
    user: 'root',
    password: '090705jk',
    database: 'fitness_db',
    port: 3306,
});
const tryConnectToDatabase = (maxRetries = 10, retryInterval = 10000) => {
    let attempt = 0;

    const connect = () => {
        attempt++;
        console.log(`Attempting to connect to MySQL (Attempt ${attempt} of ${maxRetries})...`);

        db.connect((err) => {
            if (err) {
                console.error('MySQL connection error:', err.message);

                if (attempt < maxRetries) {
                    console.log(`Retrying in ${retryInterval / 1000} seconds...`);
                    setTimeout(connect, retryInterval);
                } else {
                    console.error('Failed to connect to MySQL after multiple attempts.');
                }
            } else {
                console.log('Connection to MySQL!');
                initializeDatabase();
            }
        });
    };

    connect();
};
tryConnectToDatabase();

const initializeDatabase = () => {
    db.connect((err) => {
        if (err) {
            console.error('MySQL connection error:', err);
            return;
        }
        const makeUsersTQuery = `
            CREATE TABLE IF NOT EXISTS users
            (
                id
                INT
                AUTO_INCREMENT
                PRIMARY
                KEY,
                email
                VARCHAR
            (
                255
            ) NOT NULL UNIQUE,
                name VARCHAR
            (
                255
            ),
                password VARCHAR
            (
                255
            ),
                age INT,
                height FLOAT
                );
        `;
        db.query(makeUsersTQuery, (err, results) => {
            if (err) {
                console.error('Error creating users table:', err);
                return;
            }
            console.log('Users table has made.');
        });
        const makeUserVahaTable = `
            CREATE TABLE IF NOT EXISTS user_characteristics_vaha
            (
                id
                INT
                AUTO_INCREMENT
                PRIMARY
                KEY,
                user_id
                INT
                NOT
                NULL,
                datum
                DATE
                NOT
                NULL,
                hodnota
                FLOAT
                NOT
                NULL,
                metoda
                VARCHAR
            (
                255
            ),
                FOREIGN KEY
            (
                user_id
            ) REFERENCES users
            (
                id
            ) ON DELETE CASCADE
                );
        `;
        db.query(makeUserVahaTable, (err, results) => {
            if (err) {
                console.error('Error creating usersVaha table:', err);
                return;
            }
            console.log('UsersVaha table has made.');
        });
        const makeUserKrokyTable = `
            CREATE TABLE IF NOT EXISTS user_characteristics_kroky
            (
                id
                INT
                AUTO_INCREMENT
                PRIMARY
                KEY,
                user_id
                INT
                NOT
                NULL,
                datum
                DATE
                NOT
                NULL,
                hodnota
                FLOAT
                NOT
                NULL,
                metoda
                VARCHAR
            (
                255
            ),
                FOREIGN KEY
            (
                user_id
            ) REFERENCES users
            (
                id
            ) ON DELETE CASCADE
                );
        `;
        db.query(makeUserKrokyTable, (err, results) => {
            if (err) {
                console.error('Error creating usersKroky table:', err);
                return;
            }
            console.log('usersKroky table has made.');
        });
        const makeUserTepTable = `
            CREATE TABLE IF NOT EXISTS user_characteristics_tep
            (
                id
                INT
                AUTO_INCREMENT
                PRIMARY
                KEY,
                user_id
                INT
                NOT
                NULL,
                datum
                DATE
                NOT
                NULL,
                hodnota
                FLOAT
                NOT
                NULL,
                metoda
                VARCHAR
            (
                255
            ),
                FOREIGN KEY
            (
                user_id
            ) REFERENCES users
            (
                id
            ) ON DELETE CASCADE
                );
        `;
        db.query(makeUserTepTable, (err, results) => {
            if (err) {
                console.error('Error creating usersTep table:', err);
                return;
            }
            console.log('usersTep table has made.');
        });
        const makeMethodsTable = `
            CREATE TABLE IF NOT EXISTS methods
            (
                id
                INT
                AUTO_INCREMENT
                PRIMARY
                KEY,
                name
                VARCHAR
            (
                255
            ) NOT NULL,
                description TEXT
                );
        `;
        db.query(makeMethodsTable, (err, results) => {
            if (err) {
                console.error('Error creating Methods table:', err);
                return;
            }
            console.log('Methods table has made.');
        });
        const makeAdvertismentsTable = `
            CREATE TABLE IF NOT EXISTS advertisements
            (
                id
                INT
                AUTO_INCREMENT
                PRIMARY
                KEY,
                image_url
                VARCHAR
            (
                255
            ) NOT NULL,
                target_url VARCHAR
            (
                255
            ) NOT NULL,
                click_count INT DEFAULT 0
                );
        `;
        db.query(makeAdvertismentsTable, (err, results) => {
            if (err) {
                console.error('Error creating Advertisements table:', err);
                return;
            }
            console.log('Advertisements table has made.');
        });

        console.log('Connected to MySQL!');
    });
}

app.post('/addUser', (req, res) => {
    const { email, name, password, age, height } = req.body;

    if (!email || !name || !password || !age || !height) {
        return res.status(400).json({ message: 'All fields must be filled in!' });
    }

    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ message: 'Error checking email in the database.' });
        }

        if (results.length > 0) {
            return res.status(404).json({ message: 'Email already exists!' });
        }

        const insertUserQuery = 'INSERT INTO users (email, name, password, age, height) VALUES (?, ?, ?, ?, ?)';
        db.query(insertUserQuery, [email, name, password, age, height], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).json({ message: 'Error adding user to database.' });
            }
            console.log('User is added');
            res.status(201).json({ message: 'User added successfully!', userId: result.insertId });
        });
    });
});
app.post('/login', (req, res) => {
    const { name, email, password } = req.body;

    if (name === 'admin' && password === 'admin') {
        return res.status(200).json({
            message: 'Admin login successful',
            user: {
                id: 'admin',
                name: 'Administrator',
                email: 'admin',
                isAdmin: true,
            }
        });
    }

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required!' });
    }


    const query = 'SELECT * FROM users WHERE email = ? AND password = ? AND name = ?';
    db.query(query, [email, password,name], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Server error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = results[0];
        return res.status(200).json({
            message: 'Successful entry',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: false,
            }
        });
    });
});
app.post('/addCharacteristic',(req,res)=>{
    const {user_id, datum,value,method,characteristic_type}=req.body;
    if (!user_id || !datum || !value || !characteristic_type) {
        return res.status(400).json({message: 'All fields must be filled in!'})
    }
    let targetTable;
    switch (characteristic_type) {
        case 'vaha':
            targetTable = 'user_characteristics_vaha';
            break;
        case 'tep':
            targetTable = 'user_characteristics_tep';
            break;
        case 'kroky':
            targetTable = 'user_characteristics_kroky';
            break;
        default:
            return res.status(400).json({ message: 'Invalid characteristic_type!' });
    }
    const query=`insert into ${targetTable} (user_id, datum, hodnota, metoda) VALUES (?, ?, ?, ?)`
    db.query(query, [user_id,datum,value,method],(err, results) => {
        if (err){
            console.error('Error adding characteristic:', err);
            return res.status(500).json({ message: 'Failed to add characteristic.' });
        }
        res.status(201).json({ message: 'Characteristic added successfully!'});
    })
});

app.get('/getUserCharacteristics/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT id, user_id, datum, hodnota, metoda, 'vaha' AS characteristic_type
        FROM user_characteristics_vaha
        WHERE user_id = ?

        UNION ALL

        SELECT id, user_id, datum, hodnota, metoda, 'tep' AS characteristic_type
        FROM user_characteristics_tep
        WHERE user_id = ?

        UNION ALL

        SELECT id, user_id, datum, hodnota, metoda, 'kroky' AS characteristic_type
        FROM user_characteristics_kroky
        WHERE user_id = ?

        ORDER BY datum DESC;
    `;

    db.query(query, [userId, userId, userId], (err, results) => {
        if (err) {
            console.error('Error fetching user characteristics:', err);
            return res.status(500).json({ message: 'Failed to fetch user characteristics.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No characteristics found for this user.' });
        }

        res.status(200).json(results);
    });
});

app.delete('/deleteCharacteristic/:tableName/:id', (req, res) => {
    const { tableName, id } = req.params;

    const validTables = ['user_characteristics_vaha', 'user_characteristics_tep', 'user_characteristics_kroky'];

    if (!validTables.includes(tableName)) {
        return res.status(400).json({ message: 'Invalid table name.' });
    }

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ message: 'ID must be a valid number.' });
    }

    const query = `DELETE FROM ${tableName} WHERE id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting characteristic:', err);
            return res.status(500).json({ message: 'Error deleting characteristic from database.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Characteristic not found.' });
        }

        res.status(200).json({ message: 'Characteristic deleted successfully!' });
    });
});
app.post('/addMethod', (req, res) => {
    const { name, description } = req.body;

    const checkQuery = 'SELECT * FROM methods WHERE name = ?';
    db.query(checkQuery, [name], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error checking method name' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Method with this name already exists.' });
        }

        const query = 'INSERT INTO methods (name, description) VALUES (?, ?)';
        db.query(query, [name, description], (err) => {
            if (err) {
                console.error('Error adding method: ', err);
                return res.status(500).json({ message: 'Error adding method' });
            }

            const fetchAllQuery = 'SELECT * FROM methods';
            db.query(fetchAllQuery, (err, allMethods) => {
                if (err) {
                    console.error('Error fetching updated methods: ', err);
                    return res.status(500).json({ message: 'Error fetching updated methods' });
                }

                res.status(200).json({ message: 'Method added successfully!', methods: allMethods });
            });

        });
    });
});
app.delete('/deleteMethod/:id', (req, res) => {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ message: 'ID must be a valid number' });
    }

    const query = 'DELETE FROM methods WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting method:', err);
            return res.status(500).json({ message: 'Error deleting method' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Method not found' });
        }

        const fetchMethodsQuery = 'SELECT * FROM methods';

        db.query(fetchMethodsQuery, (err, methods) => {
            if (err) {
                console.error('Error fetching methods:', err);
                return res.status(500).json({ message: 'Error fetching updated methods' });
            }

            return res.status(200).json({
                message: 'Method successfully deleted',
                methods: methods
            });
        });

    });
});
app.get('/getMethods', (req, res) => {
    const query = 'SELECT id, name, description FROM methods';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error getting methods' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Methods not found' });
        }

        return res.status(200).json(results || []);
    });
});

app.get('/getUserData/:userId', (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }
    const query = `
        SELECT datum AS date, hodnota AS value, metoda AS method, 'vaha' AS characteristic_type
        FROM user_characteristics_vaha
        WHERE user_id = ? AND datum BETWEEN ? AND ?
        
        UNION
        
        SELECT datum AS date, hodnota AS value, metoda AS method, 'tep' AS characteristic_type
        FROM user_characteristics_tep
        WHERE user_id = ? AND datum BETWEEN ? AND ?
        
        UNION
        
        SELECT datum AS date, hodnota AS value, metoda AS method, 'kroky' AS characteristic_type
        FROM user_characteristics_kroky
        WHERE user_id = ? AND datum BETWEEN ? AND ?
    `;


    db.query(query, [userId, startDate, endDate, userId, startDate, endDate, userId, startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No data found for the selected range' });
        }
        console.log(results)

        res.status(200).json(results);
    });
});

app.get('/exportData/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    const query = `
        SELECT id, datum, hodnota, metoda, 'vaha' AS characteristic_type
        FROM user_characteristics_vaha
        WHERE user_id = ?
        
        UNION ALL
        
        SELECT id, datum, hodnota, metoda, 'tep' AS characteristic_type
        FROM user_characteristics_tep
        WHERE user_id = ?
        
        UNION ALL
        
        SELECT id, datum, hodnota, metoda, 'kroky' AS characteristic_type
        FROM user_characteristics_kroky
        WHERE user_id = ?
    `;

    db.query(query, [userId, userId, userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching data' });
        }

        const data = rows.map(row => {
            return `${row.id},"${row.datum}","${row.hodnota}","${row.metoda}","${row.characteristic_type}"`;
        });

        const csvContent = ['id,datum,hodnota,metoda,characteristic_type', ...data].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=user_${userId}_characteristics.csv`);
        res.send(csvContent);
    });
});

function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }

            const lines = data.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            const rows = lines.slice(1).map(line => {
                const values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                return row;
            });

            resolve(rows);
        });
    });
}
app.post('/upload/:userId', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.params.userId;
    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    try {
        const results = await parseCSV(filePath);
        console.log('CSV file successfully processed:', results);

        const insertQuery = (table) => `
            INSERT INTO ${table} (user_id, datum, hodnota, metoda)
            VALUES (?, ?, ?, ?)
        `;

        results.forEach(row => {
            const { datum, hodnota, metoda, characteristic_type } = row;

            let formattedDatum = new Date(datum);
            formattedDatum.setHours(formattedDatum.getHours() + 1);
            formattedDatum = formattedDatum.toISOString().split('T')[0];

            let table = '';

            switch (characteristic_type) {
                case 'vaha':
                    table = 'user_characteristics_vaha';
                    break;
                case 'tep':
                    table = 'user_characteristics_tep';
                    break;
                case 'kroky':
                    table = 'user_characteristics_kroky';
                    break;
                default:
                    console.error('Invalid characteristic_type:', characteristic_type);
                    return;
            }

            db.query(insertQuery(table), [userId, formattedDatum, hodnota, metoda], (err, result) => {
                if (err) {
                    console.error('Error inserting record into', table, ':', err);
                    return res.status(500).json({ message: 'Error processing file' });
                }
            });
        });

        res.status(200).json({ message: 'File uploaded and data processed successfully' });
    } catch (err) {
        console.error('Error reading file:', err);
        res.status(500).json({ message: 'Error processing file' });
    } finally {
        fs.unlinkSync(filePath);
    }
});


app.post('/increment-click/:adId', (req, res) => {
    const adId = req.params.adId;

    const query=`select * from advertisements where id=${adId}`

    db.query(query,[adId], (err, results) => {
        if (err) {
            console.error('Error fetching advertisement:', err);
            return res.status(500).json({ message: 'Error fetching advertisement from the database' });
        }
        if (results.length === 0) {
            return res.status(404).send('Advertisement not found');
        }


        const updateQuery = 'UPDATE advertisements SET click_count = click_count + 1 WHERE id = ?';
        db.query(updateQuery, [adId], (err) => {
            if (err) {
                console.error('Error updating click count:', err);
                return res.status(500).send('Error updating click count');
            }
            res.status(200).send('Click count updated');
        });


    });
});

app.get('/next-advertisement', (req, res) => {
    const offset = parseInt(req.query.offset, 10) || 0;

    const countQuery = 'SELECT COUNT(*) AS total FROM advertisements';
    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error('Error fetching total advertisement count:', err);
            return res.status(500).json({ message: 'Error fetching advertisement count from the database' });
        }

        const totalAdvertisements = countResult[0].total;

        if (totalAdvertisements > 0) {
            const adjustedOffset = offset % totalAdvertisements;

            const query = 'SELECT * FROM advertisements ORDER BY id LIMIT 1 OFFSET ?';
            db.query(query, [adjustedOffset], (err, results) => {
                if (err) {
                    console.error('Error fetching advertisement:', err);
                    return res.status(500).json({ message: 'Error fetching advertisement from the database' });
                }
                if (results.length === 0) {
                    return res.status(404).send('Advertisement not found');
                }

                res.status(200).json(results[0]);
            });
        } else {

            return res.status(404).send('No advertisements available');
        }
    });
});

app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json(results);
    });
});
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    });
});
app.get('/users/csv', (req, res) => {
    db.query('SELECT email, name, password, age FROM users', (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching data from the database');
        }

        if (rows.length === 0) {
            return res.status(404).send('No users found');
        }

        const headers = ['email','name','password','age'];

        const data = rows.map(row => {
            return `"${row.email}","${row.name}","${row.password}","${row.age}"`;
        });

        const csvContent = [headers.join(','), ...data].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

        res.send(csvContent);
    });
});
app.post('/upload-csv', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');


    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    const users = lines.map((line, index) => {
        if (index === 0 && line.includes('email')) return null;

        const [email, name, password, age, height] = line.split(',').map(field => field.replace(/"/g, '').trim());

        return [email, name, password, parseInt(age, 10), parseFloat(height)];
    }).filter(user => user !== null);

    // console.log(users);

    const validUsers = [];

    const queryCheck = 'SELECT email FROM users WHERE email = ?';
    const queryInsert = `
        INSERT INTO users (email, name, password, age)
        VALUES ?`;

    const checkAndInsert = async () => {
        for (const user of users) {
            try {
                const [rows] = await db.promise().query(queryCheck, [user[0]]);

                if (rows.length === 0) {
                    validUsers.push([user[0], user[1], user[2], user[3]]);
                } else {
                    console.log(`Duplicate email skipped: ${user[0]}`);
                }
            } catch (err) {
                console.error('Error checking user:', err);
                return res.status(500).send('Error during validation');
            }
        }

        if (validUsers.length > 0) {
            db.query(queryInsert, [validUsers], (err, result) => {
                fs.unlinkSync(filePath);

                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).send('Error saving data to the database');
                }

                res.status(200).send({
                    message: 'CSV file uploaded and data saved successfully'
                });
            });
        } else {
            fs.unlinkSync(filePath);
            res.status(200).send({ message: 'No new users to insert (all duplicates).' });
        }
    };

    checkAndInsert();

});
app.get('/advertisements', (req, res) => {
    const query = 'SELECT * FROM advertisements';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error when retrieving data from the database' });
        }

        res.json(results);
    });
});
app.post('/advertisements', (req, res) => {
    const { image_url, target_url, click_count } = req.body;


    if (!image_url || !target_url) {
        return res.status(400).json({ message: 'Image URL and Target URL are required' });
    }

    const query = 'INSERT INTO advertisements (image_url, target_url, click_count) VALUES (?, ?, ?)';
    db.query(query, [image_url, target_url, click_count || 0], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to add advertisement' });
        }
        res.status(201).json({ message: 'Advertisement added successfully' });
    });
});
app.delete('/advertisements/:id', (req, res) => {
    const adId = req.params.id;

    if (!adId) {
        return res.status(400).json({ message: 'Advertisement ID is required' });
    }

    const query = 'DELETE FROM advertisements WHERE id = ?';

    db.query(query, [adId], (err, result) => {
        if (err) {
            console.error('Error deleting advertisement:', err);
            return res.status(500).json({ message: 'Failed to delete advertisement' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.status(200).json({ message: `Advertisement with ID ${adId} deleted successfully` });
    });
});
app.put('/advertisements/:id', (req, res) => {
    const adId = req.params.id;
    const { image_url, target_url, click_count } = req.body;

    if (!image_url || !target_url) {
        return res.status(400).json({ message: 'Image URL and Target URL are required' });
    }

    const query = `
        UPDATE advertisements
        SET image_url = ?, target_url = ?, click_count = ?
        WHERE id = ?
    `;

    db.query(query, [image_url, target_url, click_count, adId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to update advertisement' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.status(200).json({ message: 'Advertisement updated successfully' });
    });
});

app.get('/hello', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ message: "Hello from the server!" });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
app.listen(PORT, () => {
    console.log(`The HTTP server is launched at http://localhost:${PORT}`);
});
