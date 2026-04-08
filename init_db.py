import sqlite3

def setup_database():
    # This creates the greenpulse.db file automatically in your folder
    conn = sqlite3.connect('greenpulse.db')
    cursor = conn.cursor()

    # Create Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            city TEXT DEFAULT 'Bengaluru',
            journeys INTEGER DEFAULT 0,
            co2_saved INTEGER DEFAULT 0,
            lungs_avg INTEGER DEFAULT 0
        )
    ''')

    # Create History table for your charts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            date TEXT,
            lungs_score INTEGER,
            FOREIGN KEY(user_email) REFERENCES users(email)
        )
    ''')

    conn.commit()
    conn.close()
    print("Database file 'greenpulse.db' created successfully! 🌿")

if __name__ == "__main__":
    setup_database()