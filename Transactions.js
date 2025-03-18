const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new sqlite3.Database('banking.db', (err) => { //connect to database SQLLite
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        //create accounts table
        db.run(`CREATE TABLE IF NOT EXISTS accounts (
            account_id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            balance REAL NOT NULL
        )`);

        //create transactions table
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id TEXT,
            transaction_type TEXT,
            amount REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        //insert test account if it doesn't exist
        db.run(`INSERT OR IGNORE INTO accounts (account_id, customer_name, balance) VALUES ('ACC001', 'Test User', 1000.0)`);
    });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); //serve the main page
});
app.post('/accounts/create', (req, res) => { //create new account endpoint
    const { customer_name, initial_balance } = req.body;
    const numBalance = parseFloat(initial_balance) || 0;

    if (!customer_name) {
        return res.status(400).json({ error: 'Customer name is required' });
    }

    const accountId = 'ACC' + Math.floor(Math.random() * 900 + 100); //generate a new account ID

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        //sql commands to ensure atomicity
        db.run('INSERT INTO accounts (account_id, customer_name, balance) VALUES (?, ?, ?)',
            [accountId, customer_name, numBalance],
            (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Failed to create account' });
                }

                if (numBalance > 0) {
                    db.run('INSERT INTO transactions (account_id, transaction_type, amount) VALUES (?, ?, ?)',
                        [accountId, 'credit', numBalance],
                        (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Failed to record initial deposit' });
                            }
                            db.run('COMMIT');
                            res.json({ 
                                message: 'Account created successfully', 
                                account_id: accountId,
                                initial_balance: numBalance
                            });
                        });
                } else {
                    db.run('COMMIT');
                    res.json({ 
                        message: 'Account created successfully', 
                        account_id: accountId,
                        initial_balance: numBalance
                    });
                }
            });
    });
});

app.get('/accounts', (req, res) => { //get all accounts endpoint
    db.all('SELECT account_id, customer_name, balance FROM accounts', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});


app.post('/transactions/debit', (req, res) => { //debit endpoint
    const { account_id, amount } = req.body;
    const numAmount = parseFloat(amount);

    if (!account_id || !numAmount) {
        return res.status(400).json({ error: 'Account ID and amount are required' });
    }

    db.serialize(() => {
        db.get('SELECT balance FROM accounts WHERE account_id = ?', [account_id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Account not found' });
            }
            if (row.balance < numAmount) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }

            db.run('BEGIN TRANSACTION');

            const newBalance = row.balance - numAmount;
            db.run('UPDATE accounts SET balance = ? WHERE account_id = ?', 
                [newBalance, account_id], (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Transaction failed' });
                    }

                    db.run('INSERT INTO transactions (account_id, transaction_type, amount) VALUES (?, ?, ?)',
                        [account_id, 'debit', numAmount], (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Transaction failed' });
                            }

                            db.run('COMMIT');
                            res.json({ message: 'Debit successful', new_balance: newBalance });
                        });
                });
        });
    });
});

// Credit endpoint
app.post('/transactions/credit', (req, res) => {
    const { account_id, amount } = req.body;
    const numAmount = parseFloat(amount);

    if (!account_id || !numAmount) {
        return res.status(400).json({ error: 'Account ID and amount are required' });
    }

    db.serialize(() => {
        db.get('SELECT balance FROM accounts WHERE account_id = ?', [account_id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Account not found' });
            }

            db.run('BEGIN TRANSACTION');

            const newBalance = row.balance + numAmount;
            db.run('UPDATE accounts SET balance = ? WHERE account_id = ?', 
                [newBalance, account_id], (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Transaction failed' });
                    }

                    db.run('INSERT INTO transactions (account_id, transaction_type, amount) VALUES (?, ?, ?)',
                        [account_id, 'credit', numAmount], (err) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Transaction failed' });
                            }

                            db.run('COMMIT');
                            res.json({ message: 'Credit successful', new_balance: newBalance });
                        });
                });
        });
    });
});

app.get('/accounts/:account_id/balance', (req, res) => { //balance inquiry endpoint
    const account_id = req.params.account_id;

    db.get('SELECT balance FROM accounts WHERE account_id = ?', [account_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Account not found' });
        }

        res.json({ account_id, balance: row.balance });
    });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 