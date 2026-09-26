from fastapi import FastAPI, Query
import sqlite3

app = FastAPI()

@app.get("/users")
def get_user(username: str = Query(...)):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # ❌ VULNERABLE: user input is directly concatenated into SQL
    query = "SELECT id, username, email FROM users WHERE username = '" + username + "'"

    cursor.execute(query)
    users = cursor.fetchall()

    conn.close()
    return {"users": users}