package com.auction.enums;

public enum PaymentStatus {
    PENDING("Pending", "00"),
    PROCESSING("Processing", "01"),
    COMPLETED("Payment completed", "02"),
    FAILED("Payment failed", "03"),
    EXPIRED("Payment expired", "04"),
    REFUNDED("Payment refunded", "05"),
    CANCELLED("Payment cancelled", "06"),
    INVALID_CHECKSUM("Invalid checksum", "97");

    private final String message;
    private final String code;

    PaymentStatus(String message, String code) {
        this.message = message;
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public String getCode() {
        return code;
    }

    public static PaymentStatus fromCode(String code) {
        for (PaymentStatus status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        return FAILED;
    }
} 