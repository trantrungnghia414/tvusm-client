// client/src/app/(admin)/dashboard/reports/types/reportTypes.ts
export interface DateRangeType {
    from: Date;
    to: Date;
}

export interface ReportFilters {
    dateRange: DateRangeType;
    reportType: "overview" | "bookings" | "revenue" | "users" | "venues";
    period: "daily" | "weekly" | "monthly" | "yearly";
    venueId?: number;
    courtId?: number;
}

export interface OverviewStats {
    totalBookings: number;
    totalRevenue: number;
    totalUsers: number;
    totalVenues: number;
    averageRating: number;
    completionRate: number;
    cancellationRate: number;
    topVenue: {
        name: string;
        bookings: number;
    };
}

export interface BookingStats {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    peakHours: Array<{
        hour: string;
        count: number;
    }>;
    dailyBookings: Array<{
        date: string;
        count: number;
    }>;
}

export interface RevenueStats {
    totalRevenue: number;
    dailyRevenue: Array<{
        date: string;
        amount: number;
    }>;
    monthlyRevenue: Array<{
        month: string;
        amount: number;
    }>;
    revenueByVenue: Array<{
        venueName: string;
        amount: number;
    }>;
    paymentMethods: Array<{
        method: string;
        amount: number;
        count: number;
    }>;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: Array<{
        date: string;
        count: number;
    }>;
    usersByRole: Array<{
        role: string;
        count: number;
    }>;
    topUsers: Array<{
        name: string;
        bookings: number;
        revenue: number;
    }>;
}

export interface VenueStats {
    totalVenues: number;
    activeVenues: number;
    venueUtilization: Array<{
        venueName: string;
        utilizationRate: number;
        totalBookings: number;
    }>;
    courtUtilization: Array<{
        courtName: string;
        venueName: string;
        utilizationRate: number;
    }>;
}

export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface ExportOptions {
    format: "pdf" | "excel" | "csv";
    includeCharts: boolean;
    dateRange: DateRangeType;
    reportType: string;
}
