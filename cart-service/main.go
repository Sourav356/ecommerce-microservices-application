package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "Cart Service is healthy"})
}

func cartHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    // Simplistic auth: pass username via header or query for now, but usually it's injected by Gateway.
    // We'll require a "X-User-Id" header, fallback to query param "userId".
    userID := r.Header.Get("X-User-Id")
    if userID == "" {
        userID = r.URL.Query().Get("userId")
    }
    if userID == "" {
        http.Error(w, `{"error": "Missing user identification"}`, http.StatusUnauthorized)
        return
    }

    switch r.Method {
    case http.MethodGet:
        items, err := GetItems(userID)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        json.NewEncoder(w).Encode(items)
        
    case http.MethodPost:
        var req CartItem
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        if err := AddItem(userID, req.ProductID, req.Quantity); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(map[string]string{"message": "Item added to cart"})

    case http.MethodDelete:
        if err := ClearCart(userID); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        json.NewEncoder(w).Encode(map[string]string{"message": "Cart cleared"})

    default:
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}

func main() {
    initDB() // Call initDB from db.go
	http.HandleFunc("/health", healthHandler)
    http.HandleFunc("/api/cart", cartHandler)
    http.HandleFunc("/api/cart/", cartHandler)
	log.Println("Cart Service running on port 4004")
	log.Fatal(http.ListenAndServe(":4004", nil))
}
