package com.auction.payment.service.impl;

import com.auction.payment.model.PaymentOrder;
import com.auction.payment.service.VNPayService;
import com.auction.payment.util.QrCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.net.URLEncoder;

@Service
@Slf4j
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNPayService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.payUrl}")
    private String paymentUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    private final QrCodeGenerator qrCodeGenerator;

    @Override
    public String createPaymentUrl(PaymentOrder order) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = order.getOrderCode();
        String vnp_IpAddr = "127.0.0.1"; // For development
        String vnp_TmnCode = tmnCode;
        String orderType = "other";
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(order.getAmount().longValue() * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(fieldValue);
                try {
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    log.error("Error encoding URL parameters", e);
                    throw new RuntimeException("Error creating payment URL", e);
                }
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(hashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        String paymentUrl = this.paymentUrl + "?" + queryUrl;
        
        // Update payment URL and QR code in order
        order.setPaymentUrl(paymentUrl);
        order.setQrCodeUrl(qrCodeGenerator.generateQrCodeBase64(paymentUrl));
        
        return paymentUrl;
    }

    @Override
    public boolean validatePaymentResponse(Map<String, String> response) {
        // Remove vnp_SecureHash from response to validate
        String vnp_SecureHash = response.get("vnp_SecureHash");
        response.remove("vnp_SecureHash");
        response.remove("vnp_SecureHashType");

        // Sort parameters
        List<String> fieldNames = new ArrayList<>(response.keySet());
        Collections.sort(fieldNames);
        
        // Create hash data
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = response.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(fieldValue);
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        // Validate secure hash
        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());
        return calculatedHash.equals(vnp_SecureHash);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac sha512_HMAC = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            sha512_HMAC.init(secretKey);
            byte[] messageBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = sha512_HMAC.doFinal(messageBytes);
            return bytesToHex(result);
        } catch (Exception ex) {
            log.error("Error generating HMAC SHA-512", ex);
            return "";
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
} 