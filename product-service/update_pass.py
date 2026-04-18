from database import engine
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text("UPDATE user_schema.users SET password='SecureAdmin@2026' WHERE username='admin'"))
    conn.commit()
    print("Successfully updated admin password to SecureAdmin@2026 natively.")
