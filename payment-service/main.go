package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

type PaymentRequest struct {
	OrderID int     `json:"order_id"`
	Amount  float64 `json:"amount"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "Payment Service is healthy",
	})
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
	// Load .env (only for local dev)
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	initDB()

	port := os.Getenv("PORT")
	if port == "" {
		port = "4007"
	}

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/payments/process", processHandler)

	log.Printf("Payment Service running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}