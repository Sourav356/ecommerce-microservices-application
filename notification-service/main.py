from fastapi import FastAPI
from pydantic import BaseModel

class NotificationRequest(BaseModel):
    username: str
    order_id: int
    amount: float

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "Notification Service is healthy"}

@app.post("/api/notifications/send")
def send_notification(req: NotificationRequest):
    print(f"📧 EMAIL DISPATCHED TO: {req.username} | Order #{req.order_id} | Amount: ${req.amount}")
    return {"status": "Notification sent successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4008)
