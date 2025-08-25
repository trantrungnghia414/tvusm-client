// client/src/app/(admin)/dashboard/reports/types/reportTypes.ts
export interface DateRangeType {
    from: Date;
    to: Date;
}

export interface ReportFilters {
    dateRange: DateRangeType;
    reportType: "revenue" | "customers" | "venues" | "bookings";
    period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    venueId?: number;
    courtId?: number;
    customerId?: number;
}

// Thống kê doanh thu
export interface RevenueStats {
    // Tổng quan
    totalRevenue: number;
    totalBookings: number;
    averageRevenuePerBooking: number;
    revenueGrowth: number;

    // Thống kê theo thời gian
    dailyRevenue: Array<{
        date: string;
        amount: number;
        bookings: number;
    }>;
    weeklyRevenue: Array<{
        week: string;
        amount: number;
        bookings: number;
    }>;
    monthlyRevenue: Array<{
        month: string;
        amount: number;
        bookings: number;
    }>;
    quarterlyRevenue: Array<{
        quarter: string;
        amount: number;
        bookings: number;
    }>;
    yearlyRevenue: Array<{
        year: string;
        amount: number;
        bookings: number;
    }>;

    // Thống kê theo khách hàng
    revenueByCustomer: Array<{
        customerId: number;
        customerName: string;
        totalAmount: number;
        totalBookings: number;
        averageAmount: number;
        lastBookingDate: string;
    }>;
    customerBookingFrequency: Array<{
        frequency: string;
        customerCount: number;
        totalRevenue: number;
    }>;

    // Thống kê theo sân
    revenueByVenue: Array<{
        venueId: number;
        venueName: string;
        totalAmount: number;
        totalBookings: number;
        averageAmount: number;
        utilizationRate: number;
    }>;
    revenueByCourt: Array<{
        courtId: number;
        courtName: string;
        venueName: string;
        totalAmount: number;
        totalBookings: number;
        averageAmount: number;
        utilizationRate: number;
    }>;

    // Thống kê phương thức thanh toán
    paymentMethods: Array<{
        method: string;
        amount: number;
        count: number;
        percentage: number;
    }>;

    // Thống kê theo loại sân
    revenueBySportType: Array<{
        sportType: string;
        amount: number;
        bookings: number;
        percentage: number;
    }>;
}

// Thống kê khách hàng
export interface CustomerStats {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    returningCustomers: number;

    // Thống kê theo tần suất đặt sân
    bookingFrequency: Array<{
        frequency: string;
        customerCount: number;
        percentage: number;
    }>;

    // Top khách hàng
    topCustomers: Array<{
        customerId: number;
        customerName: string;
        totalBookings: number;
        totalRevenue: number;
        averageRevenue: number;
        lastBookingDate: string;
    }>;

    // Thống kê theo thời gian
    customerGrowth: Array<{
        date: string;
        newCustomers: number;
        totalCustomers: number;
    }>;

    // Thống kê theo loại khách hàng
    customersByType: Array<{
        type: string;
        count: number;
        percentage: number;
        totalRevenue: number;
    }>;
}

// Thống kê sân thi đấu
export interface VenueStats {
    totalVenues: number;
    activeVenues: number;
    totalCourts: number;
    activeCourts: number;

    // Thống kê sử dụng theo sân
    venueUtilization: Array<{
        venueId: number;
        venueName: string;
        utilizationRate: number;
        totalBookings: number;
        totalRevenue: number;
        averageRevenue: number;
    }>;

    // Thống kê sử dụng theo từng sân con
    courtUtilization: Array<{
        courtId: number;
        courtName: string;
        venueName: string;
        utilizationRate: number;
        totalBookings: number;
        totalRevenue: number;
        averageRevenue: number;
    }>;

    // Thống kê theo loại sân
    utilizationBySportType: Array<{
        sportType: string;
        totalBookings: number;
        totalRevenue: number;
        averageUtilization: number;
    }>;

    // Thống kê theo thời gian
    utilizationTrend: Array<{
        date: string;
        averageUtilization: number;
        totalBookings: number;
    }>;
}

// Thống kê đặt sân
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

export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
    secondaryValue?: number; // Cho biểu đồ có 2 trục Y
}

export interface ExportOptions {
    format: "pdf" | "excel" | "csv";
    includeCharts: boolean;
    dateRange: DateRangeType;
    reportType: string;
}
