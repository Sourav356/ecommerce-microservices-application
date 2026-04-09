package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" { dbUser = "postgres" }
	dbPass := os.Getenv("DB_PASS")
	if dbPass == "" { dbPass = "Sourav@26" }
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" { dbHost = "localhost" }
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" { dbPort = "5432" }
	dbName := os.Getenv("DB_NAME")
	if dbName == "" { dbName = "ecommerce" }

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable&search_path=cart_schema", dbUser, dbPass, dbHost, dbPort, dbName)
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Could not connect to Database:", err)
	}
	
	err = db.Ping()
	if err != nil {
		log.Println("Cart schema Ping Failed:", err)
	} else {
		log.Println("Connected to Cart Postgres schema")
		setupSchema()
	}
}

func setupSchema() {
	_, err := db.Exec(`CREATE SCHEMA IF NOT EXISTS cart_schema;`)
	if err != nil {
		log.Println("Error creating schema", err)
	}
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS cart_schema.cart_items (
			id SERIAL PRIMARY KEY,
			session_id VARCHAR(255) NOT NULL,
			product_id INT NOT NULL,
			quantity INT NOT NULL,
			added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`)
	if err != nil {
		log.Println("Error creating cart items table", err)
	}

	// Seed Dummy Data
	var count int
	err = db.QueryRow(`SELECT COUNT(*) FROM cart_schema.cart_items`).Scan(&count)
	if err == nil && count == 0 {
		_, err = db.Exec(`
			INSERT INTO cart_schema.cart_items (session_id, product_id, quantity)
			VALUES ('demo-session-987', 1, 2), ('demo-session-987', 3, 1)
		`)
		if err == nil {
			log.Println("Seeded dummy cart items into cart_schema")
		}
	}
}

type CartItem struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}

func AddItem(sessionID string, productID int, quantity int) error {
	_, err := db.Exec(`INSERT INTO cart_schema.cart_items (session_id, product_id, quantity) VALUES ($1, $2, $3)`, sessionID, productID, quantity)
	return err
}

func GetItems(sessionID string) ([]CartItem, error) {
	rows, err := db.Query(`SELECT product_id, quantity FROM cart_schema.cart_items WHERE session_id = $1`, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []CartItem{}
	for rows.Next() {
		var item CartItem
		if err := rows.Scan(&item.ProductID, &item.Quantity); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func ClearCart(sessionID string) error {
	_, err := db.Exec(`DELETE FROM cart_schema.cart_items WHERE session_id = $1`, sessionID)
	return err
}
