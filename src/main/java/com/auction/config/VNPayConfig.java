package com.auction.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

@Configuration
@Getter
public class VNPayConfig {
    // API Version
    @Value("${vnpay.version}")
    private String vnpayVersion;

    // Merchant Configuration
    @Value("${vnpay.tmnCode}")
    private String vnpayTmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnpayHashSecret;

    // API Endpoints
    @Value("${vnpay.payUrl}")
    private String vnpayPayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnpayReturnUrl;

    @Value("${vnpay.apiUrl}")
    private String vnpayApiUrl;

    // Default sandbox values
    public static final String SANDBOX_TMN_CODE = "0D2YNE5X";
    public static final String SANDBOX_HASH_SECRET = "UES6VTPLUHW311XGHQQLEY20Q4ZKW994";
    public static final String SANDBOX_PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String SANDBOX_API_URL = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";

    // Getters with fallback to sandbox values
    public String getTmnCode() {
        return vnpayTmnCode != null ? vnpayTmnCode : SANDBOX_TMN_CODE;
    }

    public String getHashSecret() {
        return vnpayHashSecret != null ? vnpayHashSecret : SANDBOX_HASH_SECRET;
    }

    public String getPayUrl() {
        return vnpayPayUrl != null ? vnpayPayUrl : SANDBOX_PAY_URL;
    }

    public String getApiUrl() {
        return vnpayApiUrl != null ? vnpayApiUrl : SANDBOX_API_URL;
    }
} 