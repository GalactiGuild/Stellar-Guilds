# Image Upload Flow Diagram

## Complete Request Flow

```mermaid
graph TB
    A[Client/Postman] -->|POST multipart/form-data| B[Controller Endpoint]
    B --> C{FileInterceptor}
    C -->|Parse File| D[Validator: validateImageFile]
    
    D --> E{Validation Checks}
    E -->|Missing File| F[❌ 400 Bad Request<br/>'File is required']
    E -->|Size > 5MB| G[❌ 400 Bad Request<br/>'File size must be less than 5MB']
    E -->|Invalid MIME| H[❌ 400 Bad Request<br/>'File must be jpeg/png/webp']
    E -->|Valid File| I[Service Method]
    
    I --> J[Check Permissions]
    J -->|No Access| K[❌ 403 Forbidden]
    J -->|Has Access| L[StorageService.uploadFile]
    
    L --> M{Storage Type?}
    M -->|AWS S3 Configured| N[Upload to S3 Bucket]
    M -->|Local Storage| O[Save to ./uploads folder]
    
    N --> P[Get Public URL]
    O --> P
    
    P --> Q[Delete Old File if Exists]
    Q --> R[Update Database]
    R --> S[Return Success Response]
    
    S --> T[✅ 200 OK<br/>avatarUrl/bannerUrl/logoUrl]
```

## Component Architecture

```mermaid
graph LR
    subgraph "Presentation Layer"
        A[UserController]
        B[GuildController]
    end
    
    subgraph "Business Logic Layer"
        C[UserService]
        D[GuildService]
        E[Validator]
    end
    
    subgraph "Data Layer"
        F[StorageService]
        G[PrismaService]
    end
    
    subgraph "Storage"
        H[S3 Bucket]
        I[Local ./uploads]
    end
    
    A --> E
    B --> E
    A --> C
    B --> D
    C --> F
    D --> F
    E -->|Validate First| F
    F --> H
    F --> I
    C --> G
    D --> G
```

## Validation Flow Detail

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Validator
    participant Service
    participant Storage
    participant Database
    
    Client->>Controller: POST /users/me/avatar<br/>(multipart/form-data)
    
    Note over Controller: FileInterceptor<br/>parses file
    
    Controller->>Validator: validateImageFile(file)
    
    alt File Missing
        Validator-->>Controller: Throw BadRequestException
        Controller-->>Client: 400 Bad Request
    else Size > 5MB
        Validator-->>Controller: Throw BadRequestException
        Controller-->>Client: 400 Bad Request
    else Invalid MIME Type
        Validator-->>Controller: Throw BadRequestException
        Controller-->>Client: 400 Bad Request
    else Valid File
        Validator-->>Controller: ✓ Pass
        
        Controller->>Service: updateAvatar(userId, file)
        
        Service->>Storage: uploadFile(buffer, filename)
        
        alt AWS S3 Configured
            Storage->>Storage: Upload to S3
        else Local Storage
            Storage->>Storage: Save to ./uploads
        end
        
        Storage-->>Service: Return URL
        
        Service->>Database: Update user.avatarUrl
        Database-->>Service: Updated Record
        
        Service-->>Controller: Return Result
        
        Controller-->>Client: 200 OK + URL
    end
```

## Error Handling Flow

```mermaid
graph TD
    A[Request Received] --> B{Authentication?}
    B -->|No JWT| C[❌ 401 Unauthorized]
    B -->|Valid JWT| D{Authorization?}
    
    D -->|No Permission| E[❌ 403 Forbidden]
    D -->|Has Permission| F{File Present?}
    
    F -->|No File| G[❌ 400 - File Required]
    F -->|File Present| H{Size ≤ 5MB?}
    
    H -->|Too Large| I[❌ 400 - Size Error]
    H -->|Size OK| J{MIME Type Valid?}
    
    J -->|Invalid Type| K[❌ 400 - Type Error]
    J -->|Valid| L{Guild Exists?}
    
    L -->|Not Found| M[❌ 404 Not Found]
    L -->|Exists| N[Upload to Storage]
    
    N --> O{Storage Success?}
    O -->|Failed| P[❌ 500 Server Error]
    O -->|Success| Q[Update Database]
    
    Q --> R{DB Success?}
    R -->|Failed| P
    R -->|Success| S[✅ 200 OK]
```

## Success Response Structure

```mermaid
graph LR
    A[Response Object] --> B[data]
    A --> C[meta]
    
    B --> D[avatarUrl/bannerUrl/logoUrl]
    B --> E[message]
    
    C --> F[timestamp]
    C --> G[path]
    C --> H[statusCode]
    C --> I[duration]
```

## File Storage Decision Tree

```mermaid
graph TD
    A[StorageService.uploadFile] --> B{AWS Credentials Set?}
    
    B -->|Yes| C{All Required Env Vars?}
    C -->|ACCESS_KEY, SECRET_KEY,<br/>REGION, BUCKET| D[Use AWS S3]
    C -->|Missing Vars| E[Fall Back to Local]
    
    B -->|No| E
    
    D --> F[Upload to S3 Bucket]
    F --> G[Set ACL: public-read]
    G --> H[Return S3 URL]
    
    E --> I[Create ./uploads Directory]
    I --> J[Write File Locally]
    J --> K[Return APP_URL/uploads/filename]
```

## Authorization Flow for Guild Endpoints

```mermaid
sequenceDiagram
    participant User
    participant GuildController
    participant GuildService
    participant PrismaDB
    
    User->>GuildController: POST /guilds/:id/logo
    
    GuildController->>GuildService: updateGuildLogo(id, file, userId)
    
    GuildService->>PrismaDB: Find Guild by ID
    
    alt Guild Not Found
        PrismaDB-->>GuildService: null
        GuildService-->>GuildController: NotFoundException
        GuildController-->>User: 404 Not Found
    else Guild Found
        PrismaDB-->>GuildService: Guild Data
        
        GuildService->>PrismaDB: Check Membership
        
        alt Not Member
            PrismaDB-->>GuildService: null
            GuildService-->>GuildController: ForbiddenException
            GuildController-->>User: 403 Forbidden
        else Member
            PrismaDB-->>GuildService: Membership
            
            GuildService->>GuildService: Check Role Weight
            
            alt Role < ADMIN
                GuildService-->>GuildController: ForbiddenException
                GuildController-->>User: 403 Forbidden
            else Role >= ADMIN
                GuildService->>GuildService: Continue with Upload
            end
        end
    end
```

## Cleanup Flow (Old File Deletion)

```mermaid
graph TD
    A[New File Uploaded] --> B{Old File Exists?}
    
    B -->|No| C[Skip Deletion]
    B -->|Yes| D[Get Old File URL]
    
    D --> E{Storage Type?}
    E -->|S3| F[Delete from S3 Bucket]
    E -->|Local| G[Delete from ./uploads]
    
    F --> H{Deletion Success?}
    G --> H
    
    H -->|Yes| I[Complete]
    H -->|No/Error| J[Log Warning<br/>Continue Anyway]
    
    J --> I
```

## Testing Coverage Map

```mermaid
mindmap
  root((Image Upload<br/>Tests))
    Unit Tests
      Validator
        Valid File
        Missing Buffer
        Missing Name
        Size Limit
        MIME Types
          Accept JPEG
          Accept PNG
          Accept WebP
          Reject GIF
          Reject BMP
    E2E Tests
      User Avatar
        Valid PNG
        Valid JPEG
        Valid WebP
        No Auth
        Invalid Type
      Guild Logo
        Valid Upload
        No Auth
        Wrong Guild
      Guild Banner
        Valid Upload
        No Auth
    Manual Tests
      Postman
        All Formats
        Size Limits
        Error Cases
      Swagger UI
        Documentation
        Try It Out
```

## Security Layers

```mermaid
graph TB
    A[Incoming Request] --> B[Layer 1: Authentication<br/>JWT Guard]
    B --> C[Layer 2: Authorization<br/>Role Guard]
    C --> D[Layer 3: File Validation<br/>Size & MIME]
    D --> E[Layer 4: Filename Sanitization<br/>UUID Prefix]
    E --> F[Layer 5: Path Protection<br/>Resolve & Verify]
    F --> G[Layer 6: Storage Isolation<br/>S3 or Sandbox]
    
    B -->|Fail| H[❌ 401]
    C -->|Fail| I[❌ 403]
    D -->|Fail| J[❌ 400]
    E -->|Fail| K[❌ 500]
    F -->|Fail| L[❌ 500]
    
    G --> M[✅ Success]
```

---

**Legend:**
- ❌ = Error/Failure
- ✅ = Success
- → = Flow Direction
- <> = Conditional Check
