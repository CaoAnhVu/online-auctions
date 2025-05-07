package com.auction.payment.service.impl;

import com.auction.config.VNPayConfig;
import com.auction.payment.model.PaymentOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Autowired
    private VNPayConfig vnPayConfig;

    public String createPaymentUrl(PaymentOrder order, String ipAddress) {
        String vnp_Version = vnPayConfig.getVnpayVersion();
        String vnp_Command = "pay";
        String vnp_TxnRef = order.getOrderCode();
        String vnp_IpAddr = ipAddress;
        String vnp_TmnCode = vnPayConfig.getTmnCode();
        String vnp_TransactionType = "02"; // Thanh toán hóa đơn
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(order.getAmount().multiply(new java.math.BigDecimal("100")).longValue())); // Nhân 100 vì VNPay tính theo xu
        vnp_Params.put("vnp_CurrCode", "VND");
        
        // Thông tin đơn hàng
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + order.getOrderCode());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        
        // Thông tin return
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpayReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_TransactionType", vnp_TransactionType);

        // Thời gian thanh toán
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Tạo chuỗi hash
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
                query.append(urlEncode(fieldName));
                query.append('=');
                query.append(urlEncode(fieldValue));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }

    public boolean validateCallback(Map<String, String> params) {
        // Trong môi trường dev, luôn trả về true
        if (vnPayConfig.getTmnCode().equals(VNPayConfig.SANDBOX_TMN_CODE)) {
            return true;
        }

        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        // Tạo chuỗi hash
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(fieldValue);
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String calculatedHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        return calculatedHash.equals(vnp_SecureHash);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac sha512Hmac = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            sha512Hmac.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = sha512Hmac.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private String urlEncode(String value) {
        try {
            return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8.toString());
        } catch (Exception e) {
            return value;
        }
    }
} 