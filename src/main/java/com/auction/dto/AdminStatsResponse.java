package com.auction.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminStatsResponse {
    private long totalUsers;
    private long newUsers;
    private long totalAuctions;
    private long activeAuctions;
    private long totalBids;
    private long totalRevenue;
    private List<DailyStat> dailyStats;
    private List<CategoryStat> categoryStats;

    @Data
    public static class DailyStat {
        private String date;
        private long revenue;
        private long activeUsers;
    }

    @Data
    public static class CategoryStat {
        private String category;
        private long count;
    }
}
