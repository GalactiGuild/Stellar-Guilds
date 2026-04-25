# Image Upload Implementation Guide

## Overview

This guide documents the implementation of validated image upload endpoints using NestJS FileInterceptor and StorageService.

## Features Implemented

✅ **File Size Validation**: Maximum 5MB per file  
✅ **MIME Type Validation**: Only JPEG, PNG, and WebP formats allowed  
✅ **Validation Before Storage**: All validation occurs before files touch the storage service  
✅ **User Avatar Upload**: `/users/me/avatar` endpoint  
✅ **Guild Logo Upload**: `/guilds/:id/logo` endpoint  
✅ **Guild Banner Upload**: `/guilds/:id/banner` endpoint  
✅ **Proper Error Handling**: Clear error messages for validation failures  
✅ **Swagger Documentation**: Full API documentation with multipart/form-data support  

## Architecture

### File Flow

```
Client (Postman/Frontend)
    ↓ multipart/form-data
Controller (FileInterceptor)
    ↓ validation
Validator (validateImageFile)
    ↓ valid file
StorageService → S3 or Local Storage
    ↓ URL
Database (User/Guild record)
```

### Components

1. **File Validator** (`src/common/utils/file-upload.validator.ts`)
   - Centralized validation logic
   - Reusable across all upload endpoints
   - Validates size and MIME type

2. **Controllers**
   - `UserController`: User avatar upload
   - `GuildController`: Guild logo and banner uploads

3. **Services**
   - `UserService.updateAvatar()`: Handles user avatar updates
   - `GuildService.updateGuildLogo()`: Handles guild logo updates
   - `GuildService.updateGuildBanner()`: Handles guild banner updates
   - `StorageService.uploadFile()`: Stores file (S3 or local)
   - `StorageService.deleteFile()`: Cleans up old files

## API Endpoints

### 1. Upload User Avatar

**Endpoint:** `POST /users/me/avatar`  
**Authentication:** Required (JWT Bearer token)  
**Content-Type:** `multipart/form-data`

**Request:**
- Form field name: `file`
- File type: JPEG, PNG, or WebP
- Max size: 5MB

**Success Response (200):**
```json
{
  "data": {
    "avatarUrl": "http://localhost:3000/uploads/uuid-filename.png",
    "message": "Avatar updated successfully"
  },
  "meta": {
    "timestamp": "2026-03-27T10:00:00.000Z",
    "path": "/users/me/avatar",
    "statusCode": 200
  }
}
```

**Error Responses:**

400 Bad Request - File too large:
```json
{
  "message": "File size must be less than 5MB",
  "error": "Bad Request",
  "statusCode": 400
}
```

400 Bad Request - Invalid file type:
```json
{
  "message": "File must be one of the following types: image/jpeg, image/png, image/webp",
  "error": "Bad Request",
  "statusCode": 400
}
```

401 Unauthorized:
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### 2. Upload Guild Logo

**Endpoint:** `POST /guilds/:id/logo`  
**Authentication:** Required (JWT Bearer token)  
**Authorization:** Guild ADMIN or OWNER role  
**Content-Type:** `multipart/form-data`

**Path Parameters:**
- `id` (string): Guild ID (UUID)

**Request:**
- Form field name: `file`
- File type: JPEG, PNG, or WebP
- Max size: 5MB

**Success Response (200):**
```json
{
  "data": {
    "logoUrl": "http://localhost:3000/uploads/uuid-filename.png",
    "message": "Guild logo updated successfully"
  },
  "meta": {
    "timestamp": "2026-03-27T10:00:00.000Z",
    "path": "/guilds/:id/logo",
    "statusCode": 200
  }
}
```

---

### 3. Upload Guild Banner

**Endpoint:** `POST /guilds/:id/banner`  
**Authentication:** Required (JWT Bearer token)  
**Authorization:** Guild ADMIN or OWNER role  
**Content-Type:** `multipart/form-data`

**Path Parameters:**
- `id` (string): Guild ID (UUID)

**Request:**
- Form field name: `file`
- File type: JPEG, PNG, or WebP
- Max size: 5MB

**Success Response (200):**
```json
{
  "data": {
    "bannerUrl": "http://localhost:3000/uploads/uuid-filename.png",
    "message": "Guild banner updated successfully"
  },
  "meta": {
    "timestamp": "2026-03-27T10:00:00.000Z",
    "path": "/guilds/:id/banner",
    "statusCode": 200
  }
}
```

---

## Testing with Postman

### Setup

1. **Get Authentication Token**
   - Login to get JWT token
   - Copy the token from response

2. **Configure Postman Request**

   For User Avatar:
   ```
   POST http://localhost:3000/users/me/avatar
   Headers:
     Authorization: Bearer <YOUR_JWT_TOKEN>
   Body → form-data:
     Key: file (set type to File)
     Value: Select an image file
   ```

   For Guild Logo:
   ```
   POST http://localhost:3000/guilds/<GUILD_ID>/logo
   Headers:
     Authorization: Bearer <YOUR_JWT_TOKEN>
   Body →form-data:
     Key: file (set type to File)
     Value: Select an image file
   ```

### Test Cases

#### ✅ Valid Upload (PNG)
- File: Small PNG image (< 5MB)
- Expected: 200 OK with avatarUrl/bannerUrl/logoUrl

#### ✅ Valid Upload (JPEG)
- File: JPEG image (< 5MB)
- Expected: 200 OK

#### ✅ Valid Upload (WebP)
- File: WebP image (< 5MB)
- Expected: 200 OK

#### ❌ File Too Large
- File: Image > 5MB (e.g., 6MB)
- Expected: 400 Bad Request
- Message: "File size must be less than 5MB"

#### ❌ Invalid File Type (GIF)
- File: GIF image
- Expected: 400 Bad Request
- Message: "File must be one of the following types: image/jpeg, image/png, image/webp"

#### ❌ Invalid File Type (BMP)
- File: BMP image
- Expected: 400 Bad Request

#### ❌ No Authentication
- Remove Authorization header
- Expected: 401 Unauthorized

#### ❌ Missing File
- Don't attach file field
- Expected: 400 Bad Request
- Message: "File is required"

## Code Structure

### Files Created/Modified

```
backend/src/
├── common/utils/
│   ├── file-upload.validator.ts       (NEW - Validation logic)
│   └── file-upload.validator.spec.ts  (NEW - Unit tests)
├── user/
│   └── user.controller.ts             (MODIFIED - Added validation to avatar endpoint)
└── guild/
    ├── guild.controller.ts            (NEW - Added logo and banner endpoints)
    ├── guild.service.ts               (MODIFIED - Added upload methods)
    └── guild.module.ts                (MODIFIED - Added StorageModule import)
```

### Validation Logic

```typescript
// src/common/utils/file-upload.validator.ts

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function validateImageFile(file: {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
}): void {
  // Check file exists
  if (!file?.buffer || !file?.originalname) {
    throw new BadRequestException('File is required');
  }

  // Check file size
  if (file.buffer.length > MAX_FILE_SIZE) {
    throw new BadRequestException('File size must be less than 5MB');
  }

  // Check MIME type
  const mimeType = file.mimetype;
  if (!mimeType) {
    throw new BadRequestException('File MIME type could not be determined');
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new BadRequestException(
      'File must be one of the following types: ' + 
      ALLOWED_MIME_TYPES.join(', ')
    );
  }
}
```

### Controller Example

```typescript
@Post('me/avatar')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'))
@HttpCode(HttpStatus.OK)
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'Image file (JPEG, PNG, or WebP, max 5MB)',
      },
    },
  },
})
async uploadAvatar(
  @Request() req: any,
  @UploadedFile() file: any,
) {
  // Validate file BEFORE passing to storage service
  validateImageFile(file);
  
  const result = await this.userService.updateAvatar(req.user.userId, file);
  return {
    avatarUrl: result.avatarUrl,
    message: 'Avatar updated successfully',
  };
}
```

## Database Schema

The implementation uses existing database fields:

### User Model
```prisma
model User {
  avatarUrl   String?
  // ... other fields
}
```

### Guild Model
```prisma
model Guild {
  avatarUrl   String?  // Used for guild logo
  bannerUrl   String?  // Used for guild banner
  // ... other fields
}
```

## Storage Configuration

Files are stored based on environment configuration:

### Local Storage (Development)
```env
STORAGE_LOCAL_DIR=./uploads
APP_URL=http://localhost:3000
```

Files stored at: `./backend/uploads/<uuid>-<filename>`  
Accessible at: `http://localhost:3000/uploads/<uuid>-<filename>`

### AWS S3 (Production)
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Security Considerations

✅ **Authentication Required**: All endpoints require valid JWT tokens  
✅ **Authorization Checks**: Guild endpoints verify user has ADMIN/OWNER role  
✅ **File Size Limits**: Prevents DoS attacks via large file uploads  
✅ **MIME Type Validation**: Prevents malicious file uploads  
✅ **Filename Sanitization**: UUID prefix prevents path traversal attacks  
✅ **Extension Preservation**: Original file extension maintained for proper content-type  

## Error Handling

All endpoints follow standard error response format:

```typescript
try {
  validateImageFile(file);
  const result = await this.storageService.uploadFile(buffer, filename);
  return { url: result, message: 'Upload successful' };
} catch (error) {
  // Handled by global exception filters
  throw error;
}
```

## Running Tests

### Unit Tests
```bash
npm run test -- file-upload.validator.spec.ts
```

### E2E Tests
```bash
npm run test:e2e -- image-upload.e2e.spec.ts
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/api-upload-images

# Make changes and commit
git add .
git commit -m "feat: add validated image upload endpoints"

# Push to remote
git push origin feature/api-upload-images

# Create PR and merge after review
```

## Future Enhancements

- [ ] Add image compression/resizing
- [ ] Support multiple image uploads (gallery)
- [ ] Add image CDN integration
- [ ] Implement progress tracking for large files
- [ ] Add virus/malware scanning
- [ ] Support additional image formats based on requirements
- [ ] Add image metadata extraction (dimensions, etc.)

## Troubleshooting

### Issue: FileInterceptor not working
**Solution:** Ensure `@UseInterceptors(FileInterceptor('field-name'))` decorator is applied

### Issue: MIME type validation fails
**Solution:** Check that client sends correct Content-Type header

### Issue: Files not accessible after upload
**Solution:** Verify `/uploads` static route is configured in `main.ts`

### Issue: S3 upload fails
**Solution:** Check AWS credentials and bucket permissions

## Related Documentation

- [NestJS File Upload Docs](https://docs.nestjs.com/techniques/file-upload)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Storage Service Implementation](./src/storage/storage.service.ts)
