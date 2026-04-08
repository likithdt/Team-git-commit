import sqlite3

def init_db():
    """Initializes the SQLite database and creates necessary tables."""
    conn = sqlite3.connect('greenpulse.db')
    cursor = conn.cursor()
    
    # User Table: Stores credentials and total stats
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            city TEXT DEFAULT 'Bengaluru',
            joined_date TEXT,
            journeys INTEGER DEFAULT 0,
            co2_saved INTEGER DEFAULT 0,
            lungs_avg INTEGER DEFAULT 0
        )
    ''')
    
    # History Table: Stores history for the "Weekly Chart"
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT,
            date TEXT,
            lungs_score INTEGER,
            co2_saved INTEGER,
            FOREIGN KEY(user_email) REFERENCES users(email)
        )
    ''')
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully! 🌿")