# System Patterns: Online Auction Platform

## System Architecture

The Online Auction Platform follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│  (Thymeleaf Templates, HTML, CSS, JavaScript, Bootstrap, jQuery) │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                      Web/Controller Layer                        │
│  (Spring MVC Controllers, REST Controllers, Request Validation)  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                        Service Layer                             │
│  (Business Logic, Transaction Management, Integration Points)    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                  Data Access/Repository Layer                    │
│  (Spring Data JPA Repositories, Custom Query Methods)            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────┐
│                        Persistence Layer                         │
│  (MySQL Database, Hibernate ORM)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cross-Cutting Concerns

- **Security**: JWT-based authentication with cookie storage
- **Exception Handling**: Global exception handling with custom error responses
- **Validation**: Bean Validation (JSR 380) for input validation
- **Logging**: SLF4J with Logback for application logging
- **Configuration**: Externalized configuration using Spring profiles

## Key Technical Decisions

### Authentication & Authorization

- **JWT-Based Authentication**: Using JSON Web Tokens stored in HTTP-only cookies for enhanced security.
- **Role-Based Access Control**: Implementing RBAC with Spring Security to manage permissions for buyers, sellers, and administrators.
- **Password Security**: BCrypt password hashing with appropriate work factor for secure password storage.

### Data Persistence

- **ORM Approach**: Utilizing Hibernate via Spring Data JPA for object-relational mapping.
- **Database Schema**: Normalized schema design with appropriate indexes for performance.
- **Transaction Management**: Spring declarative transaction management with appropriate isolation levels.
- **Data Validation**: Both client-side and server-side validation to ensure data integrity.

### File Storage

- **Local File System Storage**: Images stored in configurable local directory with relative paths in the database.
- **File Type Validation**: MIME type checking and size limits for uploaded files.
- **Content Delivery**: Static resource configuration for serving files directly through Spring Boot.

### Frontend Architecture

- **Server-Side Rendering**: Using Thymeleaf for template-based views with server-side rendering.
- **Responsive Design**: Bootstrap framework for responsive layouts across device types.
- **Enhanced Interactivity**: Selective use of JavaScript/jQuery for dynamic elements.
- **Fragment-Based Composition**: Thymeleaf fragments for reusable components (header, footer, etc.).

### API Design

- **REST API Principles**: Following REST conventions for resource naming and HTTP methods.
- **Data Transfer Objects**: Using DTOs to decouple internal domain models from API representations.
- **API Documentation**: (Planned) Swagger/OpenAPI documentation for API endpoints.

## Design Patterns in Use

### Creational Patterns

- **Builder Pattern**: Used in complex object construction, particularly for DTOs and domain models.
- **Factory Method Pattern**: Utilized in service implementations for creating domain objects.
- **Singleton Pattern**: Applied via Spring's default singleton bean scope for service components.

### Structural Patterns

- **Adapter Pattern**: Used to transform between domain models and DTOs.
- **Composite Pattern**: Applied in hierarchical category structures.
- **Decorator Pattern**: Used with Spring Security for adding authentication and authorization behavior.
- **Facade Pattern**: Service layer serves as a facade over complex business operations.

### Behavioral Patterns

- **Observer Pattern**: Implemented via Spring events for auction lifecycle events.
- **Strategy Pattern**: Applied in validation strategies and bid processing.
- **Template Method Pattern**: Used in abstract base classes for common CRUD operations.
- **Chain of Responsibility**: Applied in filter chains for security and request processing.

### Architectural Patterns

- **MVC Pattern**: Core architectural pattern with Spring MVC.
- **Repository Pattern**: Data access abstraction via Spring Data repositories.
- **Dependency Injection**: Spring IoC container for dependency management.
- **DTO Pattern**: Data Transfer Objects for API request/response models.

## Component Relationships

### Core Domain Models

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │     │   Auction   │     │     Bid     │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ - userId    │1   *│ - auctionId │1   *│ - bidId     │
│ - username  ├─────┤ - title     │     │ - amount    │
│ - email     │     │ - description│    │ - bidTime   │
│ - password  │     │ - startPrice│     │ - bidder    │
│ - role      │     │ - endTime   ├─────┤ - auction   │
└──────┬──────┘     │ - seller    │     └─────────────┘
       │            └──────┬──────┘
       │                   │
       │            ┌──────┴──────┐
       │            │ AuctionImage│
       │            ├─────────────┤
       │           *│ - imageId   │
       └─────────1──┤ - auction   │
                    │ - imagePath │
                    └─────────────┘
```

### Service Layer Interactions

```
┌─────────────────────┐      ┌────────────────────┐
│   UserService       │      │  AuctionService    │
├─────────────────────┤      ├────────────────────┤
│ - Register          │      │ - Create Auction   │
│ - Authenticate      ├─────►│ - Update Auction   │
│ - Update Profile    │      │ - End Auction      │
│ - Change Role       │      │ - Find Auctions    │
└─────────────────────┘      └────────────┬───────┘
                                          │
                                          │
┌─────────────────────┐      ┌────────────▼───────┐
│   BidService        │      │  ImageService      │
├─────────────────────┤      ├────────────────────┤
│ - Place Bid         │◄─────┤ - Upload Image     │
│ - Find Highest Bid  │      │ - Delete Image     │
│ - Get Bid History   │      │ - Get Auction Images│
└─────────────────────┘      └────────────────────┘
```

### Controller-Service Dependencies

```
┌─────────────────────┐      ┌────────────────────┐
│  AuthController     │      │  UserController    │
├─────────────────────┤      ├────────────────────┤
│ - login()           │      │ - getProfile()     │
│ - register()        ├─────►│ - updateProfile()  │
│ - logout()          │      │ - changePassword() │
└────────┬────────────┘      └────────────────────┘
         │                        ▲
         │                        │
         │                        │
         ▼                        │
┌─────────────────────┐      ┌────────────────────┐
│   UserService       ├─────►│  AuctionController │
└─────────────────────┘      ├────────────────────┤
                             │ - getAuctions()    │
                             │ - createAuction()  │
                             │ - bidOnAuction()   │
                             └────────┬───────────┘
                                      │
                                      │
                                      ▼
                             ┌────────────────────┐
                             │  AuctionService    │
                             └────────┬───────────┘
                                      │
                                      │
                                      ▼
                             ┌────────────────────┐
                             │    BidService      │
                             └────────────────────┘
```

## Critical Implementation Paths

### User Registration & Authentication Flow

1. Client submits registration form
2. `AuthController.register()` validates input
3. `UserService.createUser()` checks for existing username/email
4. Password is encoded using `BCryptPasswordEncoder`
5. User entity is persisted via `UserRepository`
6. Success response is returned to client
7. Client submits login credentials
8. `AuthController.login()` delegates to Spring Security
9. `UserDetailsServiceImpl` loads user from database
10. Authentication manager validates credentials
11. `JwtTokenProvider` generates JWT token
12. Token is stored in HTTP-only cookie
13. User is redirected to home page or dashboard

### Auction Creation Flow

1. Authenticated seller accesses auction creation form
2. `AuctionController.showCreateForm()` prepares form
3. Seller submits auction details and images
4. `AuctionController.createAuction()` validates input
5. `AuctionService.createAuction()` creates auction entity
6. `ImageService.saveImages()` processes and stores uploaded images
7. Transaction is committed, saving auction and images
8. Seller is redirected to auction detail page

### Bidding Process Flow

1. Authenticated buyer views auction details
2. `AuctionController.getAuctionDetails()` retrieves auction and bids
3. Buyer submits bid amount
4. `AuctionController.placeBid()` validates bid
5. `BidService.placeBid()` validates:
   - Auction is active
   - Bid amount exceeds current highest bid + increment
   - Bidder is not seller
   - Bidder has sufficient permissions
6. New bid entity is created and persisted
7. Event notification is triggered for outbid users
8. Auction page is refreshed with updated bid information

### Admin User Management Flow

1. Admin accesses user management page
2. `AdminController.getUserManagement()` retrieves paginated user list
3. Admin selects user and action (e.g., change role)
4. `AdminController.changeUserRole()` validates request
5. `UserService.changeUserRole()` updates user role
6. Audit log entry is created
7. Response redirects back to user management with success message

## Performance Considerations

### Database Query Optimization

- Strategic use of indexes on frequently queried columns (user_id, auction_id, etc.)
- Pagination for large result sets (auctions, bids, users)
- Eager vs. lazy loading based on access patterns
- Query optimization for frequent operations

### Caching Strategy

- Page fragment caching with Thymeleaf for static components
- Second-level Hibernate cache for frequently accessed entities
- Application-level caching for reference data
- Potential for Redis integration for distributed caching

### N+1 Query Prevention

- Use of join fetches for related entities
- Strategic use of entity graphs for specific query patterns
- Batch fetching configuration for collections

## Security Implementation

### Authentication Security

- Password strength enforcement
- HTTPS-only communication
- CSRF protection for form submissions
- HTTP-only, secure cookies for JWT storage
- Session management with proper timeout and invalidation

### Authorization Controls

- Method-level security with `@PreAuthorize` annotations
- URL-based access control with Spring Security configuration
- Object-level security for auction and bid operations
- Cross-user resource access prevention

### Data Protection

- Input validation and sanitization
- Output encoding to prevent XSS
- Prepared statements to prevent SQL injection
- Secure file handling for uploaded content
- PII encryption for sensitive user data

## Error Handling & Resilience

### Exception Handling Strategy

- Global exception handler using `@ControllerAdvice`
- Custom exception types for business logic errors
- Appropriate HTTP status codes for different error types
- User-friendly error pages and messages
- Detailed logging for technical issues

### Transactional Boundaries

- Service-level transaction management
- Appropriate isolation levels based on operation
- Optimistic locking for concurrent entity updates
- Retry logic for transient failures

### System Monitoring

- Health check endpoints
- Metrics collection for key operations
- Log aggregation for error pattern identification
- Performance monitoring for critical paths

## Hệ thống thông báo thời gian thực

### Tổng quan thiết kế

Hệ thống thông báo thời gian thực sẽ cung cấp thông tin kịp thời cho người dùng về các hoạt động liên quan đến đấu giá, bao gồm đặt giá mới, đấu giá sắp kết thúc, và các cập nhật trạng thái khác.

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Sự kiện đấu  │────▶│ Notification  │────▶│  WebSocket    │
│  giá (Bid,    │     │ Service       │     │  Service      │
│  Auction...)  │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                            │                      │
                            ▼                      ▼
                      ┌───────────────┐     ┌───────────────┐
                      │               │     │               │
                      │ Notification  │     │  Connected    │
                      │ Repository    │     │  Clients      │
                      │               │     │               │
                      └───────────────┘     └───────────────┘
```

### Các thành phần chính

1. **Notification Model**:

   ```java
   @Entity
   @Table(name = "notifications")
   public class Notification {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;

       @ManyToOne
       @JoinColumn(name = "user_id")
       private User user;

       @Column(nullable = false)
       private String message;

       @Column(nullable = false)
       private String type; // BID, AUCTION_ENDING, AUCTION_WON, etc.

       @Column
       private boolean read = false;

       @Column
       private String link; // URL liên kết đến nội dung thông báo

       @CreationTimestamp
       private Timestamp createdAt;

       // getters and setters
   }
   ```

2. **Notification Repository**:

   ```java
   public interface NotificationRepository extends JpaRepository<Notification, Long> {
       List<Notification> findByUserAndReadOrderByCreatedAtDesc(User user, boolean read);
       long countByUserAndRead(User user, boolean read);
   }
   ```

3. **Notification Service**:

   ```java
   @Service
   public class NotificationService {
       @Autowired
       private NotificationRepository notificationRepository;

       @Autowired
       private WebSocketService webSocketService;

       public void createAndSendNotification(User user, String message, String type, String link) {
           // Tạo thông báo mới
           Notification notification = new Notification();
           notification.setUser(user);
           notification.setMessage(message);
           notification.setType(type);
           notification.setLink(link);

           // Lưu vào database
           notification = notificationRepository.save(notification);

           // Gửi thông báo qua WebSocket
           webSocketService.sendNotificationToUser(user.getId(), notification);
       }

       public void markAsRead(Long notificationId) {
           notificationRepository.findById(notificationId).ifPresent(notification -> {
               notification.setRead(true);
               notificationRepository.save(notification);
           });
       }

       public List<Notification> getUnreadNotifications(User user) {
           return notificationRepository.findByUserAndReadOrderByCreatedAtDesc(user, false);
       }

       public long countUnreadNotifications(User user) {
           return notificationRepository.countByUserAndRead(user, false);
       }
   }
   ```

4. **WebSocket Service**:

   ```java
   @Service
   public class WebSocketService {
       @Autowired
       private SimpMessagingTemplate messagingTemplate;

       public void sendNotificationToUser(Long userId, Notification notification) {
           messagingTemplate.convertAndSendToUser(
               userId.toString(),
               "/queue/notifications",
               notification
           );
       }

       public void sendAuctionUpdate(Long auctionId, AuctionUpdateMessage message) {
           messagingTemplate.convertAndSend(
               "/topic/auction/" + auctionId,
               message
           );
       }
   }
   ```

5. **WebSocket Configuration**:

   ```java
   @Configuration
   @EnableWebSocketMessageBroker
   public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
       @Override
       public void configureMessageBroker(MessageBrokerRegistry config) {
           config.enableSimpleBroker("/topic", "/queue");
           config.setApplicationDestinationPrefixes("/app");
       }

       @Override
       public void registerStompEndpoints(StompEndpointRegistry registry) {
           registry.addEndpoint("/ws")
                   .setAllowedOrigins("*")
                   .withSockJS();
       }
   }
   ```

### Quy trình thông báo cho các sự kiện chính

1. **Thông báo đặt giá mới**:

   - Khi người dùng đặt giá thành công, `AuctionService.placeBid()` sẽ gọi tới `NotificationService`
   - Thông báo sẽ được gửi đến: người bán, người đặt giá cao nhất trước đó, và người đặt giá hiện tại
   - Gửi cập nhật về giá hiện tại cho tất cả người dùng đang xem trang đấu giá qua WebSocket

2. **Thông báo đấu giá sắp kết thúc**:

   - Dùng `@Scheduled` task để kiểm tra các đấu giá sắp kết thúc (ví dụ: trong vòng 1 giờ)
   - Thông báo sẽ được gửi đến: người bán, người đặt giá cao nhất hiện tại, và tất cả người đã tham gia đặt giá

3. **Thông báo đấu giá kết thúc**:
   - Khi đấu giá kết thúc, thông báo sẽ được gửi đến người thắng cuộc và người bán
   - Thông báo người thắng về các bước thanh toán tiếp theo
   - Thông báo người bán về thông tin người thắng

### Tích hợp với giao diện người dùng

1. **Hiển thị thông báo**:

   ```javascript
   // application.js
   let stompClient = null;

   function connect() {
     let socket = new SockJS('/ws');
     stompClient = Stomp.over(socket);
     stompClient.connect({}, function (frame) {
       // Đăng ký nhận thông báo cá nhân
       stompClient.subscribe('/user/queue/notifications', function (notification) {
         showNotification(JSON.parse(notification.body));
       });

       // Nếu đang ở trang đấu giá, đăng ký nhận cập nhật đấu giá
       let auctionId = document.getElementById('auction-detail')?.dataset.auctionId;
       if (auctionId) {
         stompClient.subscribe('/topic/auction/' + auctionId, function (message) {
           updateAuctionData(JSON.parse(message.body));
         });
       }
     });
   }

   function showNotification(notification) {
     // Hiển thị thông báo popup
     let notificationContainer = document.getElementById('notification-container');
     let notificationElement = document.createElement('div');
     notificationElement.className = 'notification-item ' + notification.type.toLowerCase();
     notificationElement.innerHTML = `
           <div class="notification-message">${notification.message}</div>
           <div class="notification-time">${new Date(notification.createdAt).toLocaleTimeString()}</div>
           <a href="${notification.link}" class="notification-link">Xem chi tiết</a>
       `;
     notificationContainer.appendChild(notificationElement);

     // Cập nhật số lượng thông báo chưa đọc
     updateUnreadCount();
   }

   function updateAuctionData(message) {
     // Cập nhật thông tin đấu giá khi nhận được dữ liệu mới
     if (message.currentPrice) {
       document.getElementById('current-price').textContent = message.currentPrice;
     }
     if (message.bidCount) {
       document.getElementById('bid-count').textContent = message.bidCount;
     }
     if (message.bidHistory) {
       renderBidHistory(message.bidHistory);
     }
   }

   // Khởi tạo kết nối WebSocket khi trang được tải
   document.addEventListener('DOMContentLoaded', function () {
     connect();
   });
   ```

2. **Trung tâm thông báo**:
   ```html
   <!-- fragments/notification-center.html -->
   <div class="notification-center" th:fragment="notification-center">
     <div class="notification-header">
       <h3>Thông báo</h3>
       <button class="mark-all-read">Đánh dấu tất cả đã đọc</button>
     </div>
     <div class="notification-list">
       <div th:each="notification : ${notifications}" th:class="${notification.read ? 'notification-item read' : 'notification-item unread'}" th:data-id="${notification.id}">
         <div class="notification-icon" th:classappend="${notification.type.toLowerCase()}"></div>
         <div class="notification-content">
           <div class="notification-message" th:text="${notification.message}"></div>
           <div class="notification-time" th:text="${#dates.format(notification.createdAt, 'dd/MM/yyyy HH:mm')}"></div>
         </div>
         <a th:href="${notification.link}" class="notification-link">Xem</a>
       </div>
     </div>
     <div class="notification-footer">
       <a href="/notifications" class="view-all">Xem tất cả thông báo</a>
     </div>
   </div>
   ```

### Kịch bản triển khai

1. **Giai đoạn 1: Cơ sở hạ tầng**

   - Tạo model và repository cho Notification
   - Thiết lập WebSocket configuration
   - Xây dựng NotificationService và WebSocketService

2. **Giai đoạn 2: Tích hợp với sự kiện đấu giá**

   - Thêm thông báo cho sự kiện đặt giá mới
   - Tích hợp với AuctionService.placeBid()
   - Cài đặt scheduled task cho việc kiểm tra đấu giá sắp kết thúc

3. **Giai đoạn 3: Giao diện người dùng**

   - Thiết kế và triển khai UI thông báo
   - Tạo trung tâm thông báo cho người dùng
   - Phát triển trang quản lý thông báo

4. **Giai đoạn 4: Cài đặt tùy chọn**
   - Thêm thiết lập tùy chọn nhận thông báo cho người dùng
   - Cung cấp khả năng lọc và quản lý thông báo
   - Cải thiện giao diện người dùng dựa trên phản hồi

### Kế hoạch kiểm thử

1. **Unit Tests**:

   - Kiểm thử NotificationService: tạo thông báo, đánh dấu đã đọc, truy vấn
   - Kiểm thử WebSocketService: gửi thông báo đến người dùng cụ thể

2. **Integration Tests**:

   - Kiểm thử tích hợp với AuctionService
   - Kiểm thử tích hợp với scheduled tasks
   - Kiểm thử WebSocket endpoints

3. **End-to-End Tests**:
   - Kiểm thử luồng thông báo từ đặt giá đến hiển thị trên UI
   - Kiểm thử trải nghiệm người dùng với các loại thông báo khác nhau

## Hệ thống thanh toán tự động với mã QR

### Tổng quan thiết kế

Hệ thống thanh toán tự động với mã QR sẽ tạo và gửi mã QR thanh toán qua email cho người thắng đấu giá ngay khi cuộc đấu giá kết thúc. Người mua có thể quét mã QR để thanh toán nhanh chóng và an toàn, đồng thời người bán nhận được thông báo khi thanh toán hoàn tất.

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│ Auction End   │────▶│ QR Generator  │────▶│ Email Service │
│ Trigger       │     │ Service       │     │               │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
                             │                      │
                             ▼                      ▼
                      ┌───────────────┐     ┌───────────────┐
                      │               │     │               │
                      │ Transaction   │     │  Buyer Email  │
                      │ Repository    │     │  Inbox        │
                      │               │     │               │
                      └───┬───────────┘     └───────────────┘
                          │
                          │
                          ▼
                  ┌───────────────┐
                  │               │
                  │ Payment       │
                  │ Notification  │
                  │               │
                  └───────────────┘
```

### Các thành phần chính

1. **QRCodeGenerator Service**:

   ```java
   @Service
   public class QRCodeGenerator {

       @Value("${app.qrcode.path}")
       private String qrCodePath;

       @Value("${app.qrcode.width}")
       private int width;

       @Value("${app.qrcode.height}")
       private int height;

       public String generateQRCodeImage(String text, String fileName) throws WriterException, IOException {
           QRCodeWriter qrCodeWriter = new QRCodeWriter();
           BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

           Path path = Paths.get(qrCodePath);
           if (!Files.exists(path)) {
               Files.createDirectories(path);
           }

           String filePath = qrCodePath + fileName + ".png";
           Path qrCodeImagePath = Paths.get(filePath);
           MatrixToImageWriter.writeToPath(bitMatrix, "PNG", qrCodeImagePath);

           return filePath;
       }

       public String generatePaymentQRCode(Transaction transaction) throws WriterException, IOException {
           // Tạo nội dung QR code với định dạng phù hợp cho thanh toán
           // VD: Thông tin ngân hàng, số tiền, mã tham chiếu, etc.
           String qrContent = createPaymentQRContent(transaction);

           // Tạo tên file duy nhất
           String fileName = "payment_" + transaction.getTransactionId() + "_" + System.currentTimeMillis();

           // Sinh mã QR và lưu vào hệ thống
           String qrCodePath = generateQRCodeImage(qrContent, fileName);

           // Cập nhật đường dẫn QR code vào transaction
           transaction.setQrCodePath(fileName + ".png");

           return qrCodePath;
       }

       private String createPaymentQRContent(Transaction transaction) {
           // Format: BankID|AccountNo|Amount|Reference
           StringBuilder qrContent = new StringBuilder();
           qrContent.append("VietQR");
           qrContent.append("|").append(transaction.getBankInfo());
           qrContent.append("|").append(transaction.getAmount());
           qrContent.append("|").append("DAUGIA-").append(transaction.getTransactionId());
           qrContent.append("|").append(transaction.getDescription());

           return qrContent.toString();
       }
   }
   ```

2. **Email Service với mẫu QR**:

   ```java
   @Service
   public class EmailService {

       @Autowired
       private JavaMailSender emailSender;

       @Value("${spring.mail.username}")
       private String fromEmail;

       @Value("${app.email.templates.path}")
       private String templatesPath;

       @Autowired
       private TemplateEngine templateEngine;

       public void sendPaymentQREmail(User buyer, Auction auction, Transaction transaction, String qrCodePath) {
           try {
               MimeMessage message = emailSender.createMimeMessage();
               MimeMessageHelper helper = new MimeMessageHelper(message, true);

               helper.setFrom(fromEmail);
               helper.setTo(buyer.getEmail());
               helper.setSubject("Thanh toán đấu giá: " + auction.getTitle());

               // Chuẩn bị context cho template
               Context context = new Context();
               context.setVariable("userName", buyer.getFullName());
               context.setVariable("auctionTitle", auction.getTitle());
               context.setVariable("amount", transaction.getAmount());
               context.setVariable("transactionId", transaction.getTransactionId());
               context.setVariable("bankInfo", transaction.getBankInfo());
               context.setVariable("dueDate", formatDate(transaction.getDueDate()));

               // Xử lý nội dung email từ template
               String emailContent = templateEngine.process("payment-qr", context);
               helper.setText(emailContent, true);

               // Đính kèm mã QR code
               FileSystemResource qrFile = new FileSystemResource(new File(qrCodePath));
               helper.addInline("qrCode", qrFile);
               helper.addAttachment("thanh-toan-dau-gia.png", qrFile);

               // Gửi email
               emailSender.send(message);

               // Ghi log
               log.info("Đã gửi email thanh toán với mã QR đến: " + buyer.getEmail());

           } catch (MessagingException e) {
               log.error("Lỗi khi gửi email thanh toán: " + e.getMessage());
               throw new RuntimeException("Không thể gửi email thanh toán", e);
           }
       }

       private String formatDate(Date date) {
           SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm");
           return formatter.format(date);
       }
   }
   ```

3. **Transaction Service**:

   ```java
   @Service
   public class TransactionService {

       @Autowired
       private TransactionRepository transactionRepository;

       @Autowired
       private QRCodeGenerator qrCodeGenerator;

       @Autowired
       private EmailService emailService;

       @Autowired
       private NotificationService notificationService;

       @Transactional
       public void createPaymentTransaction(Auction auction, User buyer) {
           // Tạo transaction mới
           Transaction transaction = new Transaction();
           transaction.setAuction(auction);
           transaction.setBuyer(buyer);
           transaction.setAmount(auction.getCurrentPrice());
           transaction.setPaymentStatus(Transaction.PaymentStatus.PENDING);

           // Thiết lập thông tin ngân hàng từ thông tin người bán
           transaction.setBankInfo(auction.getSeller().getBankAccount());

           // Thiết lập hạn thanh toán (48 giờ từ khi kết thúc)
           Calendar calendar = Calendar.getInstance();
           calendar.add(Calendar.HOUR, 48);
           transaction.setDueDate(calendar.getTime());

           // Tạo mô tả cho giao dịch
           transaction.setDescription("Thanh toán đấu giá: " + auction.getTitle());

           // Lưu transaction vào database
           transaction = transactionRepository.save(transaction);

           try {
               // Sinh mã QR code
               String qrCodePath = qrCodeGenerator.generatePaymentQRCode(transaction);

               // Gửi email với mã QR code
               emailService.sendPaymentQREmail(buyer, auction, transaction, qrCodePath);

               // Gửi thông báo đến người mua
               String notificationMessage = "Đã gửi mã QR thanh toán cho cuộc đấu giá: " + auction.getTitle();
               notificationService.createAndSendNotification(
                   buyer,
                   notificationMessage,
                   "PAYMENT_QR",
                   "/transactions/" + transaction.getTransactionId()
               );

               // Gửi thông báo đến người bán
               String sellerNotification = "Cuộc đấu giá '" + auction.getTitle() + "' đã kết thúc với giá " +
                                           auction.getCurrentPrice() + ". Người mua đã nhận mã QR thanh toán.";
               notificationService.createAndSendNotification(
                   auction.getSeller(),
                   sellerNotification,
                   "AUCTION_ENDED",
                   "/auctions/" + auction.getAuctionId() + "/result"
               );

           } catch (Exception e) {
               log.error("Lỗi khi xử lý thanh toán QR: " + e.getMessage(), e);
               // Xử lý khi có lỗi, gửi thông báo lỗi nếu cần
           }
       }

       // Các phương thức khác...
   }
   ```

4. **Auction End Listener**:

   ```java
   @Component
   public class AuctionEndListener {

       @Autowired
       private TransactionService transactionService;

       @Autowired
       private AuctionService auctionService;

       @Autowired
       private BidService bidService;

       @EventListener
       public void handleAuctionEndEvent(AuctionEndEvent event) {
           Auction auction = event.getAuction();

           // Xác định người thắng cuộc
           Bid winningBid = bidService.getHighestBidForAuction(auction);

           if (winningBid != null) {
               // Đánh dấu bid này là winning
               winningBid.setIsWinning(true);
               bidService.saveBid(winningBid);

               // Cập nhật trạng thái auction
               auction.setStatus(Auction.Status.ENDED);
               auctionService.saveAuction(auction);

               // Tạo giao dịch thanh toán và gửi mã QR
               transactionService.createPaymentTransaction(auction, winningBid.getBidder());
           } else {
               // Xử lý trường hợp không có lượt đặt giá nào
               auction.setStatus(Auction.Status.ENDED_NO_BIDS);
               auctionService.saveAuction(auction);
           }
       }
   }
   ```

5. **Scheduled Service để kiểm tra đấu giá kết thúc**:

   ```java
   @Component
   public class AuctionScheduler {

       @Autowired
       private AuctionRepository auctionRepository;

       @Autowired
       private ApplicationEventPublisher eventPublisher;

       @Scheduled(fixedRate = 60000) // Chạy mỗi phút
       public void checkEndedAuctions() {
           Timestamp currentTime = new Timestamp(System.currentTimeMillis());

           // Tìm các đấu giá đã kết thúc nhưng chưa được xử lý
           List<Auction> endedAuctions = auctionRepository.findByEndTimeBeforeAndStatus(
               currentTime, Auction.Status.ACTIVE);

           for (Auction auction : endedAuctions) {
               // Phát sự kiện kết thúc đấu giá
               eventPublisher.publishEvent(new AuctionEndEvent(this, auction));
           }
       }
   }
   ```

### Mẫu Email Thanh Toán với QR Code

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="UTF-8" />
    <title>Thanh toán đấu giá</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
      }
      .header {
        background-color: #4caf50;
        color: white;
        padding: 10px;
        text-align: center;
      }
      .content {
        padding: 20px;
      }
      .qr-container {
        text-align: center;
        margin: 30px 0;
      }
      .qr-code {
        max-width: 200px;
      }
      .details {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
      }
      .details table {
        width: 100%;
      }
      .details td {
        padding: 8px;
      }
      .details tr:not(:last-child) {
        border-bottom: 1px solid #ddd;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #777;
        margin-top: 30px;
      }
      .btn {
        display: inline-block;
        background-color: #4caf50;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Thanh toán đấu giá</h1>
      </div>
      <div class="content">
        <p>Kính gửi <strong th:text="${userName}">Người dùng</strong>,</p>

        <p>Chúc mừng! Bạn đã thắng cuộc đấu giá <strong th:text="${auctionTitle}">Sản phẩm</strong>.</p>

        <p>Để hoàn tất giao dịch, vui lòng thanh toán theo thông tin bên dưới:</p>

        <div class="details">
          <table>
            <tr>
              <td><strong>Số tiền:</strong></td>
              <td th:text="${#numbers.formatDecimal(amount, 0, 'COMMA', 0, 'POINT')} + ' VNĐ'">10,000,000 VNĐ</td>
            </tr>
            <tr>
              <td><strong>Mã giao dịch:</strong></td>
              <td th:text="${transactionId}">TRX12345</td>
            </tr>
            <tr>
              <td><strong>Thông tin ngân hàng:</strong></td>
              <td th:text="${bankInfo}">BIDV - 12345678900</td>
            </tr>
            <tr>
              <td><strong>Hạn thanh toán:</strong></td>
              <td th:text="${dueDate}">01/01/2023 12:00</td>
            </tr>
          </table>
        </div>

        <p>Quét mã QR bên dưới để thanh toán nhanh chóng:</p>

        <div class="qr-container">
          <img class="qr-code" src="cid:qrCode" alt="Mã QR thanh toán" />
        </div>

        <p>Sau khi thanh toán, bạn sẽ nhận được xác nhận và hướng dẫn tiếp theo về việc nhận hàng.</p>

        <p>Nếu có bất kỳ thắc mắc nào, vui lòng truy cập trang thanh toán hoặc liên hệ hỗ trợ của chúng tôi.</p>

        <div style="text-align: center; margin-top: 20px;">
          <a class="btn" th:href="@{'https://yourdomain.com/transactions/' + ${transactionId}}">Xem chi tiết giao dịch</a>
        </div>
      </div>
      <div class="footer">
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        <p>© 2023 Online Auction Platform. Tất cả các quyền được bảo lưu.</p>
      </div>
    </div>
  </body>
</html>
```

### Quy trình tự động hóa gửi QR thanh toán

1. **Kích hoạt hệ thống**:

   - Cuộc đấu giá kết thúc (thời gian kết thúc đến hoặc admin kết thúc thủ công)
   - `AuctionScheduler` phát hiện đấu giá kết thúc và phát sự kiện `AuctionEndEvent`
   - `AuctionEndListener` bắt sự kiện và xử lý kết quả đấu giá

2. **Xử lý kết quả đấu giá**:

   - Xác định người thắng cuộc (lượt đặt giá cao nhất)
   - Cập nhật trạng thái đấu giá và lượt đặt giá
   - Tạo transaction mới với tình trạng "PENDING"

3. **Tạo QR code thanh toán**:

   - `QRCodeGenerator` tạo mã QR chứa thông tin thanh toán
   - Mã QR được lưu vào hệ thống và đường dẫn được cập nhật vào transaction

4. **Gửi email tự động**:

   - `EmailService` chuẩn bị email với template HTML
   - Mã QR được đính kèm vào email
   - Email được gửi đến người thắng cuộc ngay lập tức

5. **Gửi thông báo trong ứng dụng**:

   - Người mua nhận thông báo về việc đã gửi mã QR thanh toán
   - Người bán nhận thông báo về kết quả đấu giá

6. **Theo dõi thanh toán**:
   - Transaction được theo dõi để cập nhật trạng thái khi nhận được thanh toán
   - Thông báo tự động được gửi khi phát hiện thanh toán thành công

### Cấu hình hệ thống

Thêm các cấu hình sau vào `application.properties`:

```properties
# QR Code Generation
app.qrcode.path=./uploads/qrcodes/
app.qrcode.width=300
app.qrcode.height=300

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your.email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Email Templates
app.email.templates.path=classpath:/templates/email/
```

### Kế hoạch triển khai

1. **Giai đoạn 1: Phát triển hạ tầng**

   - Phát triển `QRCodeGenerator` với khả năng tạo mã QR thanh toán
   - Thiết kế và triển khai template email thanh toán
   - Bổ sung entity và repository cho Transaction

2. **Giai đoạn 2: Tích hợp hệ thống**

   - Triển khai `TransactionService` để quản lý giao dịch
   - Phát triển `AuctionEndListener` để tự động xử lý kết thúc đấu giá
   - Tích hợp với `EmailService` để gửi email thanh toán

3. **Giai đoạn 3: Kiểm thử và tối ưu**

   - Kiểm thử toàn bộ quy trình từ kết thúc đấu giá đến gửi email
   - Kiểm thử trên nhiều môi trường email và thiết bị
   - Tối ưu hóa thiết kế QR code và email template

4. **Giai đoạn 4: Theo dõi thanh toán**
   - Phát triển hệ thống theo dõi thanh toán
   - Cài đặt webhook hoặc thông báo từ ngân hàng
   - Tự động cập nhật trạng thái transaction khi thanh toán thành công
