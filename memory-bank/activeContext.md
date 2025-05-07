# Active Context: Online Auction Platform

## Current Work Focus

The development team is currently focused on enhancing the security, user experience, and administrative capabilities of the Online Auction Platform. Recent work has shifted from core feature implementation to refinement and optimization of existing features.

### Security Enhancement

A major focus area is improving the security posture of the application:

1. **JWT Cookie Implementation**

   - Recently migrated from localStorage to HTTP-only cookies for JWT token storage
   - Created `CookieUtils` class to manage cookie operations
   - Updated `JwtAuthenticationFilter` to extract tokens from cookies
   - Modified `AuthController` to set and clear cookies during login/logout

2. **Token Refresh Mechanism**
   - ✅ Implemented token refresh functionality with refresh tokens
   - ✅ Added silent refresh capability via client-side JavaScript
   - ✅ Created separate refresh token cookies with longer expiration time
   - ✅ Added endpoints for token refresh and token status checking

### Admin Dashboard Enhancement

Significant effort is being devoted to improving the administrative interface:

1. **Statistics Dashboard**

   - Recently implemented comprehensive statistics tracking
   - Added visualization charts for user distribution, auction status, and revenue
   - Created detailed seller/buyer activity metrics

2. **User Management**
   - Enhanced user role management interface
   - Added capability to view user details and activity
   - Implemented search and filtering for user lists

### Performance Optimization

The team is working on performance improvements:

1. **Database Query Optimization**

   - Refactoring repository methods to use more efficient queries
   - Adding pagination for large result sets
   - Implementing caching for frequently accessed data

### Recent Bug Fixes

1. **Database Schema and Java Enum Mismatch**

   - Fixed a critical issue where the `status` enum values in the `auctions` table didn't match the Java `Auction.Status` enum
   - Database had `ENUM('PENDING', 'ACTIVE', 'ENDED', 'CANCELLED')` while Java code used `PENDING, ACTIVE, UPCOMING, COMPLETED, CANCELLED`
   - Resolution: Updated database schema with `ALTER TABLE auctions MODIFY COLUMN status ENUM('PENDING', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING'`
   - Added safeguards in `DatabaseInitializer` to check and update the schema during application startup

2. **File Upload Issues**

   - Identified and fixed permission issues with image uploads
   - Enhanced error handling in `AuctionServiceImpl.addImageToAuction()` to provide better diagnostics
   - Added detailed logging to track file upload path, permissions, and file sizes
   - Created `UploadDirectoryInitializer` to ensure proper creation of upload directories at application startup

3. **Form Submission Failures**
   - Fixed issues with auction creation form submission
   - Improved validation feedback to users
   - Enhanced error logging for diagnostics
   - Added detailed logging of form submission data for debugging

## Active Decisions and Considerations

### Database Schema Management

The team has implemented a more robust approach to database schema management:

1. **Automated Schema Verification**

   - `DatabaseInitializer` now checks critical table structures on startup
   - Automatic attempt to fix common schema issues when detected
   - Detailed logging of database schema status

2. **Migration Approach**
   - Moving towards using Flyway or Liquibase for formal schema migrations
   - Planning to create baseline migration scripts from current schema
   - Will add version tracking to schema changes

### File Storage Strategy

Evaluating current file storage approach:

1. **Current Implementation**

   - Files stored in local filesystem (uploads/images and uploads/qrcodes directories)
   - Path references stored in database
   - Simple but has scalability limitations

2. **Considerations for Improvement**
   - Evaluating cloud storage options (AWS S3, Azure Blob Storage)
   - Considering CDN integration for image delivery
   - Exploring image optimization and multiple resolution options

### Auction Creation Process

Improving the auction creation workflow:

1. **Form Enhancement**

   - Improved validation feedback
   - Real-time validation where appropriate
   - Better category selection interface
   - Image preview capabilities

2. **Error Handling**
   - Enhanced error capturing and display
   - Detailed server-side logging
   - Persistence of form data during validation errors

## Project Insights

### Database Synchronization

The project has highlighted the importance of maintaining synchronization between database schema definitions and Java entity models. Specific learnings include:

1. **Enum Synchronization**

   - Keep Java enums and database ENUM type values in sync
   - Add automated verification on application startup
   - Consider centralizing enum definitions

2. **Schema Evolution**
   - Need for formal schema migration strategy
   - Documentation of schema changes
   - Testing of migration paths

### Error Diagnostics

Improvements to error diagnostics have proven valuable:

1. **Structured Logging**

   - Enhanced logging with context information
   - Log level optimization (DEBUG for development, INFO for production)
   - Transaction and user context in logs

2. **Client-Side Feedback**
   - Improved error messaging to users
   - Contextual help for common errors
   - Form state preservation on validation failures

### Next Steps

Immediate focus areas include:

1. **Database Robustness**

   - Complete implementation of database migration tools
   - Create comprehensive schema validation tests
   - Document all database constraints and relationships

2. **File System Security**

   - Enhance file upload security (type validation, virus scanning)
   - Implement file size limits and quota system
   - Improve error handling for storage issues

3. **Form Usability**
   - Enhance form validation with real-time feedback
   - Implement auto-save functionality for long forms
   - Add progress indicators for multi-step forms

## Recent Changes

1. **Security Upgrades**

   - Implemented cookie-based JWT storage (previously used localStorage)
   - Enhanced role-based access control across controllers
   - Added input validation on all form submissions
   - Implemented refresh token mechanism for extended sessions

2. **UI Improvements**

   - Standardized navigation components across all pages
   - Fixed responsive design issues on mobile devices
   - Improved form validation feedback
   - Added automatic token refresh to prevent session timeouts

3. **Admin Features**
   - Completed statistics dashboard with visualization charts
   - Enhanced user management capabilities
   - Added auction moderation features

### Token Refresh Implementation

1. **Backend Changes**:

   - Enhanced `JwtTokenProvider` with refresh token generation and validation
   - Added refresh token expiration configuration (longer than access tokens)
   - Created refresh token endpoint in `AuthController`
   - Updated cookie management to handle both access and refresh tokens

2. **Frontend Integration**:

   - Developed client-side silent refresh functionality
   - Added automatic token refresh before expiration
   - Integrated refresh mechanism with existing authentication flow
   - Created auth-refresh.js utility for managing token lifecycle

3. **Security Improvements**:
   - Moved from localStorage to HTTP-only cookies for token storage
   - Implemented proper token rotation on refresh
   - Added validation for refresh tokens
   - Ensured secure and HTTP-only flags on cookies

## Next Steps

Dưới đây là kế hoạch phát triển toàn diện cho Online Auction Platform, được sắp xếp theo thứ tự ưu tiên:

### HIGHEST PRIORITY: Triển khai gửi mã QR thanh toán qua email

- **Thanh toán tự động sau khi đấu giá kết thúc**:

  - Tự động tạo mã QR thanh toán khi xác định người thắng đấu giá
  - Gửi email kèm mã QR ngay lập tức đến người thắng đấu giá
  - Tích hợp thông báo trong ứng dụng cho cả người mua và người bán

- **Theo dõi trạng thái thanh toán**:
  - Xây dựng hệ thống theo dõi thanh toán tự động
  - Cập nhật trạng thái giao dịch khi phát hiện thanh toán thành công
  - Thông báo cho người bán và người mua khi thanh toán hoàn tất

### 1. Cải thiện hệ thống thông báo

- **Thông báo thời gian thực**:
  - Triển khai WebSockets để gửi thông báo ngay lập tức
  - Xây dựng service backend quản lý và gửi thông báo
  - Tạo UI thông báo cho người dùng
- **Thông báo cuộc đấu giá sắp kết thúc**:
  - Xây dựng hệ thống lên lịch kiểm tra các cuộc đấu giá sắp hết hạn
  - Triển khai service gửi thông báo cho người tham gia đấu giá
  - Tạo tùy chọn cho phép người dùng cài đặt mức độ thông báo

### 2. Hoàn thiện quản lý giao dịch

- **Xử lý thanh toán**:
  - Tích hợp cổng thanh toán an toàn
  - Xây dựng quy trình thanh toán cho người thắng đấu giá
  - Tạo trang xác nhận thanh toán và hóa đơn
- **Theo dõi trạng thái giao dịch**:
  - Xây dựng bảng điều khiển theo dõi giao dịch
  - Triển khai hệ thống cập nhật trạng thái giao dịch
  - Thêm tính năng thông báo khi trạng thái giao dịch thay đổi

### 3. Cải thiện giao diện người dùng

- **Trang theo dõi đấu giá đang tham gia**:
  - Thiết kế và triển khai trang tổng quan đấu giá
  - Tạo chức năng lọc và sắp xếp theo trạng thái đấu giá
  - Thêm thông báo trực quan về tình trạng đấu giá
- **Hiển thị lịch sử đặt giá**:
  - Xây dựng trang lịch sử đặt giá có phân trang
  - Thêm biểu đồ trực quan về hoạt động đặt giá
  - Cung cấp thông tin về tình trạng thắng/thua của các lượt đặt giá

### 4. Tăng cường bảo mật

- **Xác thực 2 yếu tố (2FA)**:
  - Triển khai xác thực 2 yếu tố cho tài khoản
  - Áp dụng 2FA bắt buộc cho giao dịch lớn
  - Xây dựng quy trình khôi phục 2FA
- **Phòng chống gian lận**:
  - Triển khai hệ thống phát hiện đặt giá bất thường
  - Xây dựng quy trình xem xét hoạt động đáng ngờ
  - Thêm xác thực bổ sung cho hoạt động rủi ro cao

### 5. Tối ưu hóa hiệu suất

- **Caching để giảm tải database**:
  - Triển khai caching cho dữ liệu thường xuyên truy cập
  - Sử dụng Redis hoặc EhCache cho caching ứng dụng
  - Tối ưu hóa caching cho phù hợp với mô hình sử dụng
- **Tối ưu truy vấn**:
  - Phân tích và tối ưu các truy vấn chậm
  - Thêm chỉ mục database phù hợp
  - Tái cấu trúc các truy vấn phức tạp

### 6. Phát triển API

- **Endpoint cho ứng dụng di động**:

  - Thiết kế và triển khai RESTful API đầy đủ
  - Xây dựng authentication và authorization cho API
  - Đảm bảo hiệu suất tốt cho clients di động

- **Tài liệu API với Swagger**:
  - Tích hợp Swagger UI để hiển thị tài liệu API
  - Bổ sung chú thích cho tất cả các endpoints
  - Tạo hướng dẫn sử dụng API

## Active Decisions and Considerations

### Architecture Decisions

1. **Cookie vs. LocalStorage for JWT**

   - **Decision**: Use HTTP-only cookies instead of localStorage
   - **Status**: Implemented
   - **Rationale**: Better security against XSS attacks
   - **Trade-offs**: More complex implementation, potential CSRF concerns (mitigated with CSRF tokens)

2. **Refresh Token Implementation**

   - **Decision**: Use separate refresh tokens with longer expiration
   - **Status**: Implemented
   - **Rationale**: Enables extended sessions without compromising security
   - **Trade-offs**: Additional complexity in token management, slightly larger cookie footprint

3. **Image Storage Solution**
   - **Decision**: Move from local file system to cloud storage (AWS S3)
   - **Status**: Planned for next phase
   - **Rationale**: Better scalability, redundancy, and CDN integration
   - **Trade-offs**: Additional cost, dependency on external service

### Technical Considerations

1. **Performance Bottlenecks**

   - Database query optimization needed for auction listings
   - Image loading time affects user experience
   - Pagination implementation required for large datasets

2. **Security Concerns**

   - JWT and refresh token validation
   - Token refresh mechanism security
   - Role-based access control enforcement
   - Input validation and sanitization

3. **Scalability Planning**
   - Current database schema supports scaling but needs indexing optimization
   - Static resource delivery should be moved to CDN
   - Consider containerization for easier deployment

## Important Patterns and Preferences

### Development Patterns

1. **Controller-Service-Repository Pattern**

   - All business logic should reside in service layer
   - Controllers should focus on request handling and response formation
   - Repositories should contain only data access logic

2. **DTO Pattern**

   - Use DTOs for data transfer between layers
   - Map entities to DTOs in service layer
   - Validate DTOs using annotation-based validation

3. **Consistent Exception Handling**
   - Use `@ControllerAdvice` for global exception handling
   - Create custom exceptions for business logic failures
   - Map exceptions to appropriate HTTP status codes

### UI/UX Patterns

1. **Responsive Design Approach**

   - Mobile-first design philosophy
   - Use Bootstrap grid system consistently
   - Test on multiple device sizes

2. **Form Handling**

   - Client-side validation with immediate feedback
   - Server-side validation as a second line of defense
   - Clear error messages with recovery instructions

3. **Navigation Structure**
   - Consistent header/footer across all pages
   - Role-based navigation options
   - Breadcrumb navigation for complex flows

## Project Insights and Learnings

1. **Security Implementation**

   - JWT implementation requires careful handling of token storage
   - Refresh tokens provide better user experience without compromising security
   - Role-based security needs to be enforced at multiple levels
   - Input validation is critical for preventing injection attacks

2. **Database Optimization**

   - Indexing strategies significantly impact performance
   - Entity relationships require careful consideration
   - Pagination is essential for large datasets

3. **UI Development**
   - Thymeleaf fragments improve maintainability
   - Consistent styling through shared CSS components
   - Form validation requires both client and server implementation
   - Client-side utilities should be modular and configurable

## Active Decisions

### Authentication Flow

We've chosen a refresh token approach with two separate tokens:

- **Access Token**: Short-lived (15 minutes) for API authorization
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens

This decision balances security (shorter-lived access tokens) with user experience (longer sessions via refresh tokens).

### Cookie Management

We're using HTTP-only cookies for both tokens to prevent XSS attacks:

- `jwt`: Contains the access token
- `refresh_token`: Contains the refresh token

Both cookies are marked as HTTP-only and secure (in production environments).

### Error Handling

The refresh mechanism includes graceful degradation:

- If refresh fails, user is redirected to login
- Silent refreshes happen in the background without disrupting UX
- Multiple failed refresh attempts trigger automatic logout

## Key Patterns

### Token Refresh Pattern

```
Client                                Server
  |                                     |
  |-------- 1. Authentication --------->|
  |                                     |
  |<-- 2. Access Token + Refresh Token -|
  |                                     |
  |------- 3. Request with Token ------>|
  |                                     |
  |<--------- 4. Response --------------|
  |                                     |
  |-- 5. Request with Expired Token --->|
  |                                     |
  |<------- 6. 401 Unauthorized --------|
  |                                     |
  |-------- 7. Refresh Token ---------->|
  |                                     |
  |<-- 8. New Access Token + Refresh ---|
  |                                     |
  |---- 9. Retry Request with Token --->|
  |                                     |
  |<--------- 10. Response -------------|
```

### Silent Refresh Implementation

The client-side implements silent refresh by:

1. Tracking token expiration time
2. Setting a timeout to refresh before expiration
3. Making an AJAX call to the refresh endpoint
4. Updating the timeout for the next refresh cycle

## Project Insights

1. **Security Balance**:

   - Using HTTP-only cookies significantly improves security posture
   - Refresh tokens provide a good balance between security and UX

2. **User Experience**:

   - Silent refresh prevents session timeouts during active use
   - Users remain logged in longer without compromising security
   - No interruptions during normal application usage

3. **Implementation Challenges**:
   - Coordinating frontend and backend token lifecycle
   - Ensuring proper error handling for refresh scenarios
   - Managing token rotation securely

## Next Steps

1. **User Experience Enhancements**:

   - Improve form validation feedback
   - Add tooltips and helper text
   - Create comprehensive error handling

2. **Performance Optimizations**:

   - Implement caching for frequently accessed data
   - Optimize database queries
   - Improve image loading and resizing

3. **Mobile Experience Improvements**:
   - Optimize pages for small screens
   - Enhance touch interactions
   - Ensure consistent responsive behavior

## Quick References

### Token Configuration

```properties
# JWT Configuration
app.jwtSecret=mySecretKey123456789012345678901234567890
app.jwtExpirationInMs=900000
app.jwtRefreshExpirationInMs=604800000
app.jwt.cookie-name=jwt
app.jwt.refresh-cookie-name=refresh_token
```

### Key Classes

- `JwtTokenProvider`: Generates and validates JWT tokens
- `JwtAuthenticationFilter`: Processes JWT from cookies for each request
- `CookieUtils`: Manages cookie creation, retrieval, and deletion
- `AuthController`: Handles authentication endpoints, including token refresh
- `auth-refresh.js`: Client-side token management

## Notification System Implementation (2024-03-20)

### Components Added

1. Model:
   - `Notification` entity with fields: id, recipient (User), message, type, read status, and creation timestamp
2. Repository:
   - `NotificationRepository` with methods for:
     - Finding notifications by recipient
     - Finding unread notifications
     - Deleting notifications
3. Service:
   - `NotificationService` interface defining notification operations
   - `NotificationServiceImpl` implementing business logic for:
     - Creating notifications
     - Managing notification status
     - Retrieving notifications
     - Deleting notifications
4. Controller:
   - `NotificationController` exposing REST endpoints:
     - GET /api/notifications
     - GET /api/notifications/unread
     - POST /api/notifications/{id}/read
     - POST /api/notifications/read-all
     - DELETE /api/notifications/{id}
     - DELETE /api/notifications

### Design Decisions

- Used lazy loading for User-Notification relationship to optimize performance
- Implemented soft deletion pattern for notifications
- Added created_at timestamp for proper ordering
- Used Spring Security for user authentication in endpoints

### Next Steps

- Implement WebSocket for real-time notifications
- Add notification preferences for users
- Create notification templates for different event types
- Add pagination for notification retrieval
- Implement notification grouping by type
