# Quick Test Reference - Image Upload Endpoints

## 🚀 Quick Start

### 1. Start the Server
```bash
cd backend
npm run start:dev
```

### 2. Get Your JWT Token
Login via your authentication endpoint and copy the JWT token.

---

## 📮 Postman Test Cases

### ✅ Test Case 1: Upload User Avatar (Valid PNG)

**Method**: POST  
**URL**: `http://localhost:3000/users/me/avatar`  
**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body** (form-data):
- Key: `file` (set type to "File")
- Value: Select a small PNG file (< 5MB)

**Expected Response**: 200 OK
```json
{
  "data": {
    "avatarUrl": "http://localhost:3000/uploads/...",
    "message": "Avatar updated successfully"
  }
}
```

---

### ✅ Test Case 2: Upload Guild Logo (Valid JPEG)

**Method**: POST  
**URL**: `http://localhost:3000/guilds/YOUR_GUILD_ID/logo`  
**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body** (form-data):
- Key: `file` (set type to "File")
- Value: Select a JPEG file (< 5MB)

**Expected Response**: 200 OK
```json
{
  "data": {
    "logoUrl": "http://localhost:3000/uploads/...",
    "message": "Guild logo updated successfully"
  }
}
```

---

### ✅ Test Case 3: Upload Guild Banner (Valid WebP)

**Method**: POST  
**URL**: `http://localhost:3000/guilds/YOUR_GUILD_ID/banner`  
**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body** (form-data):
- Key: `file` (set type to "File")
- Value: Select a WebP file (< 5MB)

**Expected Response**: 200 OK
```json
{
  "data": {
    "bannerUrl": "http://localhost:3000/uploads/...",
    "message": "Guild banner updated successfully"
  }
}
```

---

### ❌ Test Case 4: File Too Large (>5MB)

**Method**: POST  
**URL**: `http://localhost:3000/users/me/avatar`  
**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body** (form-data):
- Key: `file` (set type to "File")
- Value: Select a file larger than 5MB

**Expected Response**: 400 Bad Request
```json
{
  "message": "File size must be less than 5MB",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### ❌ Test Case 5: Invalid File Type (GIF)

**Method**: POST  
**URL**: `http://localhost:3000/users/me/avatar`  
**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body** (form-data):
- Key: `file` (set type to "File")
- Value: Select a GIF file

**Expected Response**: 400 Bad Request
```json
{
  "message": "File must be one of the following types: image/jpeg, image/png, image/webp",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### ❌ Test Case 6: No Authentication

**Method**: POST  
**URL**: `http://localhost:3000/users/me/avatar`  

**Headers**: (none)

**Body** (form-data):
- Key: `file` (set type to "File")
- Value: Select any image file

**Expected Response**: 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### ❌ Test Case 7: Missing File

**Method**: POST  
**URL**: `http://localhost:3000/users/me/avatar`  
**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body** (form-data):
- Don't add any fields

**Expected Response**: 400 Bad Request
```json
{
  "message": "File is required",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 🔍 Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3000/docs
```

Look for these endpoints:
- `POST /users/me/avatar`
- `POST /guilds/{id}/logo`
- `POST /guilds/{id}/banner`

---

## 💡 cURL Examples

### Upload Avatar
```bash
curl -X POST http://localhost:3000/users/me/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.png"
```

### Upload Guild Logo
```bash
curl -X POST http://localhost:3000/guilds/GUILD_ID/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Upload Guild Banner
```bash
curl -X POST http://localhost:3000/guilds/GUILD_ID/banner \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.webp"
```

---

## 🎯 Allowed File Types

| Format | MIME Type | Extension |
|--------|-----------|-----------|
| JPEG | image/jpeg | .jpg, .jpeg |
| PNG | image/png | .png |
| WebP | image/webp | .webp |

**Rejected formats**: GIF, BMP, TIFF, SVG, etc.

---

## ⚠️ Common Issues

### Issue: "File is required"
**Solution**: Make sure you're sending the file in a field named `file`

### Issue: "Unauthorized"
**Solution**: Add `Authorization: Bearer YOUR_TOKEN` header

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` in the backend directory

### Issue: Files not accessible
**Solution**: Check that `/uploads` folder exists and is writable

---

## 📝 Test Checklist

- [ ] Valid PNG avatar upload works
- [ ] Valid JPEG avatar upload works
- [ ] Valid WebP avatar upload works
- [ ] Guild logo upload works
- [ ] Guild banner upload works
- [ ] File size validation works (>5MB rejected)
- [ ] MIME type validation works (GIF/BMP rejected)
- [ ] Authentication required (401 without token)
- [ ] Authorization works (non-members can't upload guild images)
- [ ] Old files are deleted on update
- [ ] Swagger docs show all endpoints
- [ ] Response format matches specification

---

## 🧪 Automated Tests

Run unit tests:
```bash
npm run test -- file-upload.validator.spec.ts
```

Run e2e tests:
```bash
npm run test:e2e -- image-upload.e2e.spec.ts
```

---

**Quick Copy Responses:**

Success Message Template:
```json
{"data":{"avatarUrl":"http://localhost:3000/uploads/test.png","message":"Avatar updated successfully"}}
```

Error Message - Size:
```json
{"message":"File size must be less than 5MB","statusCode":400,"error":"Bad Request"}
```

Error Message - Type:
```json
{"message":"File must be one of the following types: image/jpeg, image/png, image/webp","statusCode":400,"error":"Bad Request"}
```
