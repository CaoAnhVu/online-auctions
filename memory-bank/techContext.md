# Technology Context: Online Auction Platform

## Core Technologies

### Backend Framework

- **Spring Boot 2.7.x**: Primary application framework providing auto-configuration, dependency injection, and embedded server
- **Spring MVC**: Web framework for handling HTTP requests and responses
- **Spring Data JPA**: Simplifies data access layer implementation with repository abstractions
- **Spring Security**: Authentication and authorization framework with robust security features
- **Hibernate ORM**: Object-relational mapping for database interactions
- **Lombok**: Reduces boilerplate code through annotations

### Frontend Technologies

- **Thymeleaf 3.x**: Server-side Java template engine for HTML generation
- **Bootstrap 5.2.x**: CSS framework for responsive design and UI components
- **jQuery 3.6.x**: JavaScript library for DOM manipulation and AJAX requests
- **Font Awesome**: Icon library for visual elements
- **SweetAlert2**: Enhanced JavaScript popup boxes

### Database

- **MySQL 8.0**: Relational database management system
- **Flyway** (Optional): Database migration tool for version control of schemas

### Development & Build Tools

- **Maven**: Dependency management and build automation
- **JDK 11+**: Java Development Kit version requirement
- **Git**: Version control system

### Testing Framework

- **JUnit 5**: Unit testing framework
- **Mockito**: Mocking framework for unit tests
- **Spring Test**: Integration testing support

### Additional Libraries

- **MapStruct**: Java bean mapping for DTO conversions
- **JJWT (io.jsonwebtoken)**: JWT creation and validation
- **Commons IO**: Utilities for file operations
- **SLF4J + Logback**: Logging framework

## Development Environment Setup

### Prerequisites

- JDK 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Git

### Local Development Configuration

```properties
# application-dev.properties
spring.datasource.url=jdbc:mysql://localhost:3306/online_auction
spring.datasource.username=root
spring.datasource.password=123456

# Email settings for dev environment
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your.email@gmail.com
spring.mail.password=your-app-password
```

### Development Workflow

1. Clone repository from version control
2. Run database scripts from `src/main/resources/database/schema.sql`
3. Configure `application-dev.properties` with local database and email settings
4. Build project with Maven: `mvn clean install`
5. Run application: `mvn spring-boot:run` or from IDE
6. Access application at `http://localhost:8080`

## Technical Constraints

### Performance Requirements

- **Page Load Time**: < 3 seconds for initial page load
- **Database Response**: < 200ms for common queries
- **Image Loading**: Progressive loading for auction images
- **Concurrent Users**: Support for 100+ simultaneous users in initial version

### Security Constraints

- **Password Storage**: BCrypt hashing with appropriate work factor
- **HTTPS**: Required for production deployment
- **Authentication**: JWT-based with HTTP-only cookies
- **Input Validation**: Server-side validation for all user inputs
- **Upload Limits**: Max 5MB per image, 20MB total per auction

### Scalability Considerations

- **Stateless Design**: Facilitates horizontal scaling
- **Database Indexing**: Optimized for read-heavy operations
- **Connection Pooling**: HikariCP for efficient database connections
- **Image Storage**: Local file system initially, with potential migration to cloud storage

### Compatibility Requirements

- **Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Support**: Responsive design for iOS and Android devices
- **Screen Sizes**: Support from 320px to 1920px width

## Dependencies & External Systems

### Core Dependencies

```xml
<!-- Spring Boot Starter Dependencies -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- Database -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>

<!-- JWT Authentication -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
</dependency>

<!-- QR Code Generation -->
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>core</artifactId>
    <version>3.5.1</version>
</dependency>
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>javase</artifactId>
    <version>3.5.1</version>
</dependency>

<!-- Utils -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.11.0</version>
</dependency>
```

### External Systems

- **Email Service**: SMTP integration for notifications (Gmail)
- **Database**: MySQL for data persistence
- **File System**: Local storage for auction images and QR codes

## Configuration Management

### Environment Profiles

- **dev**: Development environment with local database
- **test**: Testing environment with in-memory database
- **prod**: Production environment with optimized settings

### Key Configuration Properties

```properties
# Server configuration
server.port=8080

# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/online_auction
spring.datasource.username=root
spring.datasource.password=123456
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Logging
logging.level.org.springframework=INFO
logging.level.com.auction=DEBUG

# Security & JWT
app.jwt.secret=a-very-long-and-secure-secret-key-that-should-be-at-least-32-characters
app.jwt.expiration=86400000

# File uploads
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=20MB
app.file.upload-dir=./uploads/images

# Application specific
app.auction.min-bid-increment=1.00
app.name=Online Auction Platform
app.version=1.0.0
```

## Tool Usage Patterns

### Spring Boot Configuration

- **Application Properties**: Primary configuration in `application.properties` with profile-specific overrides
- **Java Configuration**: `@Configuration` classes for beans and complex setup
- **Component Scanning**: Auto-discovery of components via annotations

### Database Access Patterns

- **Spring Data Repositories**: Interface-based data access
- **Custom Queries**: JPQL for complex queries
- **Projection Interfaces**: For optimized read operations
- **Native Queries**: For specific performance-critical operations

### Security Implementation

- **Authentication Filter**: JWT token extraction and validation
- **Method Security**: `@PreAuthorize` annotations for role-based access
- **CSRF Protection**: Token-based for form submissions
- **CORS Configuration**: Configured for web browser security

### Error Handling

- **Global Exception Handler**: Centralized via `@ControllerAdvice`
- **Custom Exceptions**: Domain-specific exception classes
- **Response Entity Builder**: Standardized error response format
- **Validation Errors**: Structured binding error responses

### Front-end Asset Management

- **Static Resources**: Served from `/resources/static/`
- **Template Structure**:
  ```
  templates/
  ├── fragments/      # Reusable components
  ├── layout/         # Page layouts
  ├── auth/           # Authentication pages
  ├── auctions/       # Auction-related pages
  ├── user/           # User profile pages
  ├── admin/          # Admin dashboard
  └── error/          # Error pages
  ```

## Deployment Considerations

### Packaging

- **JAR Deployment**: Self-contained JAR with embedded Tomcat
- **External Configuration**: Environment-specific properties files
- **Database Migration**: Schema evolution scripts

### Runtime Requirements

- **Memory**: Minimum 1GB RAM recommended
- **Storage**: Depends on expected auction volume and image sizes
- **CPU**: 2+ cores recommended for production

### Monitoring

- **Actuator Endpoints**: Health, metrics, and info
- **Logging Strategy**: Rolling file appender with daily rotation
- **Performance Metrics**: Key service methods and database operations

### Backup Strategy

- **Database Backup**: Daily automated backups
- **Image Backup**: Periodic synchronization of upload directory
- **Configuration Backup**: Version-controlled configuration files

## WebSocket và thông báo thời gian thực

### Công nghệ sử dụng

1. **Spring WebSocket**

   - Phiên bản: Spring Boot 2.6+
   - Mô-đun: `spring-boot-starter-websocket`
   - Cung cấp khả năng giao tiếp hai chiều giữa client và server
   - Sử dụng giao thức STOMP cho tin nhắn

2. **SockJS**

   - Client-side library cho WebSocket
   - Cung cấp fallback cho các trình duyệt không hỗ trợ WebSocket
   - Tương thích với nhiều trình duyệt, bao gồm cả trình duyệt cũ

3. **STOMP.js**
   - Thư viện JavaScript để làm việc với giao thức STOMP
   - Cung cấp API đơn giản để gửi và nhận tin nhắn
   - Hỗ trợ subscription-based messaging

### Cấu hình WebSocket

Khi triển khai hệ thống thông báo, cần thiết lập cấu hình WebSocket như sau:

```properties
# application.properties
spring.mvc.async.request-timeout=30000
```

```yaml
# application.yml
spring:
  mvc:
    async:
      request-timeout: 30000
```

### Thư viện Client

Thêm thư viện sau vào giao diện người dùng:

```html
<!-- Thêm vào templates/fragments/scripts.html -->
<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1.6.1/dist/sockjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/stomp-websocket@2.3.4-next/lib/stomp.min.js"></script>
<script th:src="@{/js/notifications.js}"></script>
```

### Mẫu tin nhắn

Định dạng tin nhắn WebSocket sử dụng JSON để đơn giản hóa việc xử lý:

```json
// Thông báo cá nhân
{
  "id": 123,
  "type": "BID",
  "message": "Một người dùng khác đã đặt giá cao hơn cho cuộc đấu giá Laptop Dell XPS",
  "link": "/auctions/42",
  "createdAt": "2023-04-15T14:30:25",
  "read": false
}

// Cập nhật đấu giá
{
  "auctionId": 42,
  "currentPrice": 1500.00,
  "bidCount": 15,
  "bidHistory": [
    {"bidderName": "user1", "bidAmount": 1500.00, "bidTime": "2023-04-15T14:30:25"},
    {"bidderName": "user2", "bidAmount": 1400.00, "bidTime": "2023-04-15T14:20:15"}
  ]
}
```

### Xử lý kết nối mất

Để đảm bảo trải nghiệm người dùng, cần xử lý các trường hợp mất kết nối:

```javascript
// Trong notifications.js
let reconnectCount = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function connect() {
  // ... code kết nối ...

  stompClient.connect({}, onConnected, onError);
}

function onError() {
  if (reconnectCount < MAX_RECONNECT_ATTEMPTS) {
    console.log('Mất kết nối WebSocket. Đang thử kết nối lại...');
    setTimeout(() => {
      reconnectCount++;
      connect();
    }, 5000 * reconnectCount); // Backoff strategy
  } else {
    console.error('Không thể kết nối lại sau nhiều lần thử');
    // Hiển thị thông báo cho người dùng
  }
}

// Khi người dùng trở lại tab/trang web sau khi ẩn
document.addEventListener('visibilitychange', function () {
  if (!document.hidden && (!stompClient || !stompClient.connected)) {
    reconnectCount = 0;
    connect();
  }
});
```

### Tối ưu hóa hiệu suất

Để đảm bảo hiệu suất tốt khi số lượng người dùng tăng:

1. **Message Broker ngoài**

   - Khi hệ thống phát triển, cân nhắc sử dụng RabbitMQ hoặc ActiveMQ
   - Cấu hình trong Spring Boot:

   ```java
   @Configuration
   @EnableWebSocketMessageBroker
   public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
       @Override
       public void configureMessageBroker(MessageBrokerRegistry registry) {
           registry.enableStompBrokerRelay("/topic", "/queue")
                   .setRelayHost("localhost")
                   .setRelayPort(61613)
                   .setClientLogin("guest")
                   .setClientPasscode("guest");
           registry.setApplicationDestinationPrefixes("/app");
       }
   }
   ```

2. **Phân đoạn thông báo**
   - Tải thông báo theo trang thay vì tất cả cùng lúc
   - Chỉ gửi thông báo cho những người dùng đang hoạt động
