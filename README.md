# ZetaAssn Question 3

# Summary of Task
A RESTful API developed using Node.js, HTML and SQLlite that handles concurrent banking transactions - Debit, Credit, Creating new account and checking balance. The task handles atomicity and concurrency control. Supports banking transactions and throws error messages when transactions are inconsistent.

# How to run?

-- 1) clone repository and cd into it

-- 2) delete banking.bd in the folder if it exists (I have included it in the repo for the sake of demonstartion. A new .db file will be created locally).

-- 3) run: npm install (to download necessary dependencies)

-- 4) start server with: node Transactions.js

-- 5) open local host on browser: http://localhost:3000

# Output screenshots:

1) Account creation

 ![image](https://github.com/user-attachments/assets/a9079905-6c3e-45fa-939e-a111de9715d9)

 ![image](https://github.com/user-attachments/assets/39b11e29-b677-4864-8615-05ce9f7a74da)

 2) Credit transaction into created account

![image](https://github.com/user-attachments/assets/843a78fd-b54a-44d6-ab6d-d27c6f35e754)

![image](https://github.com/user-attachments/assets/bcdd3935-d28e-4eb3-9e23-24fe45ce06f6)

![image](https://github.com/user-attachments/assets/962bf2dd-4480-4717-b801-0422ab02aaff)

3) Inconsistent transactions

![image](https://github.com/user-attachments/assets/93b7af19-f360-494e-9ad7-aa20f7f8ad06)


# Task 2.2 Explanations

# 2.2 a)

Database schema:
   - ID_Transactions - Primary Key
   - ID_Account - Foreign Key (REFERENCES accounts(...))
   - Type (debit/credit)
   - Amount
   - Timestamp
   - Commit (bool if went through or not)

Each transaction will be linked to an accounts table with ID_Account as primary key and other fields like Acc_Balance etc.

# 2.2 b)

To ensure consistency:

-- Commit only when a transaction is completed.

-- Checkpointing with timestamps

-- Replicate database by storing multiple copies

# 2.2 c)

Optimizations for high performance:

-- Use big-data databases like Snowflake

-- Use meta-data management

-- Cache important data (if a user is doing multiple transactions)

-- Rate-limiting to prevent overload

-- Parallel processing and load-balancing with batch processing

-- Optimize queries with AI-API Calls

-- Secure interfaces to prevent data-leak

# Task 3 - Incorporated in Transactions.js



