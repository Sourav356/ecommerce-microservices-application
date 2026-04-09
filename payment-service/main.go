package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "Payment Service is healthy"})
}

type PaymentRequest struct {
    OrderID int     `json:"order_id"`
    Amount  float64 `json:"amount"`
}

func processHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var req PaymentRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Simulate payment processing...
    // Let's just assume success and return a dummy transaction ID.
    transactionID := "tx_" + r.RemoteAddr + "_999"

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status":         "SUCCESS",
        "transaction_id": transactionID,
        "message":        "Payment authorized successfully",
    })
}

func main() {
	http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/api/payments/process", processHandler)
	log.Println("Payment Service running on port 4007")
	log.Fatal(http.ListenAndServe(":4007", nil))
}
