package main

import (
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	connStr := os.Getenv("DB_URL")

	// Fallback for local testing
	if connStr == "" {
		connStr = "postgres://postgres:Sourav%4026@localhost:5432/ecommerce?sslmode=disable&search_path=payment_schema"
	}

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Could not open DB connection:", err)
	}

	// 🔥 Retry logic (important for Docker)
	for i := 0; i < 5; i++ {
		err = db.Ping()
		if err == nil {
			log.Println("Connected to Payment Postgres schema")
			setupSchema()
			return
		}
		log.Println("Retrying DB connection...", err)
		time.Sleep(2 * time.Second)
	}

	log.Fatal("Could not connect to DB after retries:", err)
}

func setupSchema() {
	_, err := db.Exec(`CREATE SCHEMA IF NOT EXISTS payment_schema;`)
	if err != nil {
		log.Println("Error creating schema:", err)
	}

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS payment_schema.transactions (
			id SERIAL PRIMARY KEY,
			order_id INT NOT NULL,
			amount DECIMAL(10,2) NOT NULL,
			status VARCHAR(50) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Println("Error creating transactions table:", err)
	}

	// Seed Dummy Data
	var count int
	err = db.QueryRow(`SELECT COUNT(*) FROM payment_schema.transactions`).Scan(&count)
	if err == nil && count == 0 {
		_, err = db.Exec(`
			INSERT INTO payment_schema.transactions (order_id, amount, status)
			VALUES (101, 299.99, 'COMPLETED'), (102, 149.99, 'PENDING')
		`)
		if err == nil {
			log.Println("Seeded dummy transactions into payment_schema")
		}
	}
}