package com.auction.service.impl;

import com.auction.dto.AdminStatsResponse;
import com.auction.service.AdminStatsService;
import org.springframework.stereotype.Service;
import com.auction.repository.UserRepository;
import com.auction.repository.AuctionRepository;
import com.auction.repository.BidRepository;
import com.auction.payment.repository.PaymentOrderRepository;
import com.auction.payment.model.PaymentOrder;
import com.auction.model.AuctionStatus;
import com.auction.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStatsServiceImpl implements AdminStatsService {
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final PaymentOrderRepository paymentOrderRepository;

    @Override
    public AdminStatsResponse getStats(String range) {
        AdminStatsResponse stats = new AdminStatsResponse();
        LocalDateTime fromDate = getFromDate(range);

        // Thống kê cơ bản
        stats.setTotalUsers(userRepository.count());
        stats.setTotalAuctions(auctionRepository.count());
        stats.setTotalBids(bidRepository.count());

        // Tổng doanh thu (tổng payment đã COMPLETED)
        BigDecimal totalRevenue = paymentOrderRepository.sumAmountByStatus(PaymentStatus.COMPLETED);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue.longValue() : 0);

        // Thống kê dailyStats
        List<Object[]> dailyStatsRaw = paymentOrderRepository.getDailyRevenueAndActiveUsers(PaymentStatus.COMPLETED, fromDate);
        List<AdminStatsResponse.DailyStat> dailyStats = new ArrayList<>();
        for (Object[] row : dailyStatsRaw) {
            AdminStatsResponse.DailyStat dailyStat = new AdminStatsResponse.DailyStat();
            dailyStat.setDate(row[0].toString());
            dailyStat.setRevenue(((BigDecimal) row[1]).longValue());
            dailyStat.setActiveUsers(((Long) row[2]).intValue());
            dailyStats.add(dailyStat);
        }
        stats.setDailyStats(dailyStats);

        return stats;
    }

    private LocalDateTime getFromDate(String range) {
        LocalDateTime now = LocalDateTime.now();
        return switch (range.toLowerCase()) {
            case "week" -> now.minus(7, ChronoUnit.DAYS);
            case "month" -> now.minus(30, ChronoUnit.DAYS);
            case "year" -> now.minus(365, ChronoUnit.DAYS);
            default -> now.minus(7, ChronoUnit.DAYS);
        };
    }
}
