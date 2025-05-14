package com.auction.utils;

import com.auction.payment.dto.PaymentRequest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;
import org.apache.commons.codec.binary.Hex;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;

@Component
@Slf4j
public class VNPayUtils {
    private static final String HMAC_SHA512 = "HmacSHA512";
    private static final String VNP_VERSION = "2.1.0";
    private static final String VNP_COMMAND = "pay";
    private static final String VNP_ORDER_TYPE = "other";
    private static final String VNP_DEFAULT_IP = "127.0.0.1";
    private static final String VNP_CURRENCY = "VND";
    private static final String DATE_FORMAT = "yyyyMMddHHmmss";
    private static final String REF_DATE_FORMAT = "yyMMdd";
    private static final int REF_RANDOM_LENGTH = 6;

    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance(HMAC_SHA512);
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, HMAC_SHA512);
            hmac.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac.doFinal(dataBytes);
            return Hex.encodeHexString(result);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Failed to generate HMAC", e);
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
        vnpParams.put("vnp_Version", VNP_VERSION);
        vnpParams.put("vnp_Command", VNP_COMMAND);
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(request.getAmount().multiply(new BigDecimal("100")).longValue()));
        vnpParams.put("vnp_BankCode", request.getBankCode());
        vnpParams.put("vnp_CurrCode", VNP_CURRENCY);
        
        String vnpTxnRef = getCurrentTimeString(REF_DATE_FORMAT) + getRandomNumber(REF_RANDOM_LENGTH);
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        
        vnpParams.put("vnp_OrderInfo", request.getOrderInfo());
        vnpParams.put("vnp_OrderType", VNP_ORDER_TYPE);
        vnpParams.put("vnp_Locale", request.getLanguage());
        vnpParams.put("vnp_ReturnUrl", vnpReturnUrl);
        vnpParams.put("vnp_IpAddr", VNP_DEFAULT_IP);
        
        String vnpCreateDate = getCurrentTimeString(DATE_FORMAT);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);
        
        return vnpParams;
    }
} 