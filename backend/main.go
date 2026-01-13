package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("MY_SUPER_SECRET_KEY_123")

type CustomClaims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

type GenerateResponse struct {
	Token     string `json:"token"`
	ExpiresAt int64  `json:"expiresAt"` // unix time
}

type ValidateRequest struct {
	Token string `json:"token"`
}

type ValidateResponse struct {
	Message string      `json:"message"`
	Claims  interface{} `json:"claims,omitempty"`
}

func generateJWT(userID string) (string, int64, error) {
	expTime := time.Now().Add(30 * time.Second) // ✅ 30 sec expiry

	claims := CustomClaims{
		Role: "user",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			ExpiresAt: jwt.NewNumericDate(expTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", 0, err
	}

	return signed, expTime.Unix(), nil
}

func validateJWT(tokenString string) (*CustomClaims, error) {
	tokenString = strings.TrimSpace(tokenString)

	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	// ✅ Reject expired tokens
	if claims.ExpiresAt == nil || time.Now().After(claims.ExpiresAt.Time) {
		return nil, fmt.Errorf("token expired")
	}

	return claims, nil
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
}

func generateHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.URL.Query().Get("userId")
	if userID == "" {
		userID = "101"
	}

	token, expiresAt, err := generateJWT(userID)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(GenerateResponse{
		Token:     token,
		ExpiresAt: expiresAt,
	})
}

func validateHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ValidateRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || strings.TrimSpace(req.Token) == "" {
		http.Error(w, "Token required", http.StatusBadRequest)
		return
	}

	claims, err := validateJWT(req.Token)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(ValidateResponse{Message: "Token Invalid"})
		return
	}

	respClaims := map[string]interface{}{
		"sub":  claims.Subject,
		"role": claims.Role,
		"exp":  claims.ExpiresAt.Time.Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ValidateResponse{
		Message: "Token Valid",
		Claims:  respClaims,
	})
}

func main() {
	http.HandleFunc("/generate", generateHandler)
	http.HandleFunc("/validate", validateHandler)

	fmt.Println("✅ Go JWT Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
