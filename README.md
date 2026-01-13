# Minimal JWT Auth System — Generate + Validate

A minimal **JWT authentication demo** built with **React (Vite 5 frontend)** and **Go backend**.

✅ Generate JWT (HS256 signing using secret key)  
✅ JWT Claims Included: `{ "sub": "<user-id>", "role": "user" }`  
✅ Expiration Handling (**30 seconds**)  
✅ Validate JWT (signature verify + expiry check + decode claims)  
✅ UI Timer Countdown after token generation  

---

## ✨ Demo Flow

### ✅ Generate Token
- User enters **User ID**
- Backend creates JWT with claims:
  ```json
  { "sub": "<user-id>", "role": "user" }
  ```
- Token is signed using HS256 + secret key
- Token expiry is set to 30 seconds
- Token + expiry time is returned to frontend
- Frontend shows a countdown timer

### ✅ Validate Token
- User pastes JWT token (or auto-filled from generate section)
- Backend performs:
  - ✅ Signature verification
  - ✅ Expiry verification
  - ✅ Decode payload (claims)
- Output:
  - If valid → ✅ "Token Valid" + claims
  - If invalid/expired → ❌ "Token Invalid"

## 📁 Project Structure
```
jwt-login/
├── backend-go/
│   ├── go.mod
│   └── main.go
└── frontend-react/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── App.css
        └── main.jsx
```

## ✅ Requirements

### Backend
- Go installed (go1.20+ recommended)
- JWT library used: `github.com/golang-jwt/jwt/v5`

### Frontend
- ✅ Uses Vite 5
- ✅ Recommended Node version: Node 20.19+ or 22.12+
- Check version:
  ```bash
  node -v
  npm -v
  ```

## 🚀 Setup & Run

### 1️⃣ Start Backend (Go)
```bash
cd backend-go
go mod tidy
go run main.go
```

Backend will run on:
```
http://localhost:8080
```

Expected output:
```
✅ Go JWT Server running on http://localhost:8080
```

API endpoints:
- `GET /generate?userId=101`
- `POST /validate`

### 2️⃣ Start Frontend (React - Vite 5)
```bash
cd frontend-react
npm install
npm run dev
```

Frontend will run on:
```
http://localhost:5173
```

## 🔥 API Reference

### ✅ Generate JWT
**Request**
```
GET /generate?userId=101
```

**Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "expiresAt": 1730000000
}
```

### ✅ Validate JWT
**Request**
```
POST /validate
Content-Type: application/json
```

**Body**
```json
{
  "token": "paste-token-here"
}
```

**Valid Response**
```json
{
  "message": "Token Valid",
  "claims": {
    "sub": "101",
    "role": "user",
    "exp": 1730000000
  }
}
```

**Invalid / Expired Response**
```json
{
  "message": "Token Invalid"
}
```

## ⏳ Expiry Timer UI
✅ After clicking Generate JWT, frontend shows:
- **Expires in: 30s**
- Countdown updates every second
- When timer reaches 0s → token is expired
- Backend will reject expired tokens automatically

## 🔒 Security Notes
This project demonstrates key JWT security practices:

✅ Token is signed using HS256 (HMAC SHA-256)  
✅ Signature is verified on validation  
✅ Token expiration is enforced (30 sec expiry)  
✅ Expired tokens are rejected (Token Invalid)  
✅ Claims are decoded only after signature + expiry checks  

⚠️ **This is a demo system** — it does not include refresh tokens or user database storage.

# UI
<img width="1845" height="963" alt="image" src="https://github.com/user-attachments/assets/e15871f4-8b1c-4f29-acae-30cf36b95d47" />

# Invalid Token
<img width="1845" height="963" alt="image" src="https://github.com/user-attachments/assets/11ff19b5-7ef5-43b6-9bbf-5ac903e47031" />

# Validate Token
<img width="1845" height="963" alt="image" src="https://github.com/user-attachments/assets/898e2f84-f086-4d21-9a89-91d4b9677d9d" />
