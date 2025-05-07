package com.auction.utils;

import com.auction.dto.PaymentRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;
import org.apache.commons.codec.binary.Hex;

public class VNPayUtils {
    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac.doFinal(dataBytes);
            return Hex.encodeHexString(result);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to generate HMAC", e);
        }
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public static String getCurrentTimeString(String format) {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat(format);
        return formatter.format(cal.getTime());
    }

    public static String hashAllFields(Map<String, String> fields, String secretKey) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName);
                sb.append("=");
                sb.append(fieldValue);
            }
            if (itr.hasNext()) {
                sb.append("&");
            }
        }
        
        return hmacSHA512(secretKey, sb.toString());
    }

    public static Map<String, String> toVnPayParams(PaymentRequest request, String vnpTmnCode, String vnpReturnUrl) {
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(request.getAmount() * 100));
        vnpParams.put("vnp_BankCode", request.getBankCode());
        
        String vnpTxnRef = getCurrentTimeString("yyMMdd") + getRandomNumber(6);
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        
        vnpParams.put("vnp_OrderInfo", request.getOrderInfo());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", request.getLanguage());
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", "127.0.0.1");
        
        String vnpCreateDate = getCurrentTimeString("yyyyMMddHHmmss");
        vnpParams.put("vnp_CreateDate", vnpCreateDate);
        
        return vnpParams;
    }
} 