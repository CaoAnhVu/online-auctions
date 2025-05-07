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
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

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

        // Tổng số user
        stats.setTotalUsers(userRepository.count());

        // User mới trong tuần
        LocalDateTime fromDate = LocalDate.now().minusWeeks(1).atStartOfDay();
        stats.setNewUsers(userRepository.countByCreatedAtAfter(fromDate));

        // Tổng số đấu giá
        stats.setTotalAuctions(auctionRepository.count());

        // Đấu giá đang hoạt động
        stats.setActiveAuctions(auctionRepository.countByStatus(AuctionStatus.ACTIVE));

        // Tổng số lượt bid
        stats.setTotalBids(bidRepository.count());

        // Tổng doanh thu (tổng payment đã PAID)
        BigDecimal totalRevenue = paymentOrderRepository.sumAmountByStatus(PaymentOrder.PaymentStatus.PAID);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue.longValue() : 0);

        // Thống kê dailyStats
        List<Object[]> dailyStatsRaw = paymentOrderRepository.getDailyRevenueAndActiveUsers(PaymentOrder.PaymentStatus.PAID, fromDate);
        List<AdminStatsResponse.DailyStat> dailyStats = new ArrayList<>();
        for (Object[] row : dailyStatsRaw) {
            AdminStatsResponse.DailyStat stat = new AdminStatsResponse.DailyStat();
            stat.setDate(row[0].toString());
            stat.setRevenue(((BigDecimal) row[1]).longValue());
            stat.setActiveUsers(((Number) row[2]).longValue());
            dailyStats.add(stat);
        }
        stats.setDailyStats(dailyStats);

        // Thống kê theo danh mục
        List<Object[]> categoryStatsRaw = auctionRepository.countAuctionsByCategory();
        List<AdminStatsResponse.CategoryStat> categoryStats = new ArrayList<>();
        for (Object[] row : categoryStatsRaw) {
            AdminStatsResponse.CategoryStat stat = new AdminStatsResponse.CategoryStat();
            stat.setCategory((String) row[0]);
            stat.setCount(((Number) row[1]).longValue());
            categoryStats.add(stat);
        }
        stats.setCategoryStats(categoryStats);

        return stats;
    }
}
