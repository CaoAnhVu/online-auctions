package com.auction.controller;

import com.auction.payment.dto.PaymentRequest;
import com.auction.payment.dto.PaymentResponse;
import com.auction.payment.model.PaymentOrder;
import com.auction.payment.service.PaymentService;
import com.auction.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment management APIs")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    @Operation(summary = "Create payment", description = "Creates a payment for an auction")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal User user) {
        PaymentResponse response = paymentService.createPayment(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    @Operation(summary = "Get user payments", description = "Retrieves all payments for the current user")
    public ResponseEntity<List<PaymentOrder>> getUserPayments(@AuthenticationPrincipal User user) {
        List<PaymentOrder> payments = paymentService.getUserPayments(user);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/status/{orderCode}")
    @Operation(summary = "Get payment status", description = "Retrieves the current status of a payment")
    public ResponseEntity<PaymentOrder> getPaymentStatus(@PathVariable String orderCode) {
        PaymentOrder payment = paymentService.getPaymentByOrderCode(orderCode);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/callback")
    @Operation(summary = "Process payment callback", description = "Handles payment callbacks from payment providers")
    public ResponseEntity<Void> processCallback(
            @RequestParam String orderCode,
            @RequestParam String transactionId,
            @RequestParam String status) {
        paymentService.processPaymentCallback(orderCode, transactionId, status);
        return ResponseEntity.ok().build();
    }
} 