package com.auction.payment.repository;

import com.auction.model.User;
import com.auction.payment.model.PaymentOrder;
import com.auction.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderCode(String orderCode);
    List<PaymentOrder> findByUser(User user);
    List<PaymentOrder> findByStatus(PaymentStatus status);
    List<PaymentOrder> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT p FROM PaymentOrder p WHERE p.status = 'PENDING' AND p.expiresAt < :now")
    List<PaymentOrder> findExpiredPayments(@Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentOrder p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT FUNCTION('DATE', p.createdAt), COALESCE(SUM(p.amount), 0), COUNT(DISTINCT p.user.id) " +
           "FROM PaymentOrder p WHERE p.status = :status AND p.createdAt >= :fromDate GROUP BY FUNCTION('DATE', p.createdAt) ORDER BY FUNCTION('DATE', p.createdAt)")
    List<Object[]> getDailyRevenueAndActiveUsers(@Param("status") PaymentStatus status, @Param("fromDate") LocalDateTime fromDate);
}