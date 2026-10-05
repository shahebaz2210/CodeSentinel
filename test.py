import sqlite3

def get_user(username):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # INTENTIONALLY VULNERABLE: SQL Injection
    query = "SELECT * FROM users WHERE username = '" + username + "'"

    cursor.execute(query)
    result = cursor.fetchall()

    conn.close()
    return result


if __name__ == "__main__":
    username = input("Enter username: ")
    print(get_user(username))