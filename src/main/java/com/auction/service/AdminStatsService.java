package com.auction.service;

import com.auction.dto.AdminStatsResponse;

public interface AdminStatsService {
    AdminStatsResponse getStats(String range);
}
