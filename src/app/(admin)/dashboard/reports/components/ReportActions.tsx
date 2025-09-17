import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";

// Interface cho dữ liệu báo cáo
interface DashboardStats {
    period: string;
    revenue: {
        total: number;
        growth: number;
        target?: number;
        achievement?: number;
    };
    bookings: {
        total: number;
        growth: number;
        avgValue: number;
    };
    customers: {
        total: number;
        active: number;
        new: number;
        retention: number;
    };
    courts: {
        totalCourts: number;
        avgUtilization: number;
        topPerformer: string;
    };
    trends: {
        revenueChart: Array<{ date: string; revenue: number }>;
        bookingsChart: Array<{ date: string; bookings: number }>;
    };
}

interface CustomerData {
    customer: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
        phone?: string;
    };
    bookingCount: number;
    totalSpent: number;
    lastBooking: string;
}

interface CourtUsageData {
    court: {
        court_id: number;
        name: string;
        code: string;
        type_name?: string;
        venue_name?: string;
    };
    bookingCount: number;
    revenue: number;
    utilizationRate: number;
    averageBookingDuration: number;
}

interface ReportActionsProps {
    dashboardStats: DashboardStats | null;
    customerData: CustomerData[];
    courtUsageData: CourtUsageData[];
    period: string;
    startDate?: string;
    endDate?: string;
    isCustomDate: boolean;
}

// Định nghĩa kiểu cho cell style
interface CellStyle {
    font?: {
        bold?: boolean;
        sz?: number;
        color?: { rgb: string };
        italic?: boolean;
    };
    alignment?: {
        horizontal?: "center" | "left" | "right";
        vertical?: "center" | "top" | "bottom";
    };
    fill?: {
        fgColor?: { rgb: string };
    };
    border?: {
        top?: { style: string; color: { rgb: string } };
        bottom?: { style: string; color: { rgb: string } };
        left?: { style: string; color: { rgb: string } };
        right?: { style: string; color: { rgb: string } };
    };
}

export default function ReportActions({
    dashboardStats,
    customerData,
    courtUsageData,
    period,
    startDate,
    endDate,
    isCustomDate,
}: ReportActionsProps) {
    const handleExport = async () => {
        try {
            if (!dashboardStats) {
                toast.error("Không có dữ liệu để xuất");
                return;
            }

            // Tạo workbook
            const wb = XLSX.utils.book_new();

            // === SHEET 1: TỔNG QUAN ===
            createOverviewSheet(
                wb,
                dashboardStats,
                period,
                isCustomDate,
                startDate,
                endDate
            );

            // === SHEET 2: TOP KHÁCH HÀNG ===
            createCustomerSheet(wb, customerData);

            // === SHEET 3: THỐNG KÊ SÂN ===
            createCourtSheet(wb, courtUsageData);

            // === SHEET 4: XU HƯỚNG DOANH THU ===
            if (dashboardStats.trends.revenueChart.length > 0) {
                createRevenueChart(wb, dashboardStats.trends.revenueChart);
            }

            // === SHEET 5: XU HƯỚNG ĐẶT SÂN ===
            if (dashboardStats.trends.bookingsChart.length > 0) {
                createBookingChart(wb, dashboardStats.trends.bookingsChart);
            }

            // Xuất file Excel
            const fileName = `bao_cao_thong_ke_${formatDateFilename(
                new Date()
            )}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success("Xuất Excel thành công!");
        } catch (error) {
            console.error("Lỗi khi xuất Excel:", error);
            toast.error(
                "Không thể xuất file Excel: " +
                    (error instanceof Error
                        ? error.message
                        : "Lỗi không xác định")
            );
        }
    };

    // Tạo sheet tổng quan
    const createOverviewSheet = (
        wb: XLSX.WorkBook,
        stats: DashboardStats,
        period: string,
        isCustomDate: boolean,
        startDate?: string,
        endDate?: string
    ) => {
        const overviewData = [
         
            // Header với logo và tiêu đề
            ["", "", "", "", "", ""],
            ["", "", "BÁO CÁO THỐNG KÊ NHÀ THI ĐẤU", "", "", ""],
            ["", "", "TRƯỜNG ĐẠI HỌC TRÀ VINH", "", "", ""],
            ["", "", "", "", "", ""],
            [
                `Ngày xuất: ${formatDate(new Date().toISOString())}`,
                "",
                "",
                "",
                "",
                "",
            ],
            [
                `Khoảng thời gian: ${getPeriodText(
                    period,
                    isCustomDate,
                    startDate,
                    endDate
                )}`,
                "",
                "",
                "",
                "",
                "",
            ],
            ["", "", "", "", "", ""],

            // Phần doanh thu
            ["📊 TỔNG QUAN DOANH THU", "", "", "", "", ""],
            [
                "Chỉ số",
                "Giá trị",
                "Tăng trưởng",
                "Mục tiêu",
                "Đạt được",
                "Ghi chú",
            ],
            [
                "💰 Tổng doanh thu",
                formatCurrency(stats.revenue.total),
                `${
                    stats.revenue.growth > 0 ? "+" : ""
                }${stats.revenue.growth.toFixed(2)}%`,
                stats.revenue.target
                    ? formatCurrency(stats.revenue.target)
                    : "N/A",
                stats.revenue.achievement
                    ? `${stats.revenue.achievement.toFixed(1)}%`
                    : "N/A",
                stats.revenue.growth > 0
                    ? "📈 Tăng trưởng tích cực"
                    : "📉 Cần cải thiện",
            ],
            [
                "📋 Tổng số lượt đặt",
                stats.bookings.total.toString(),
                `${
                    stats.bookings.growth > 0 ? "+" : ""
                }${stats.bookings.growth.toFixed(2)}%`,
                "",
                "",
                stats.bookings.growth > 0
                    ? "✅ Xu hướng tích cực"
                    : "⚠️ Cần quan tâm",
            ],
            [
                "💵 Giá trị TB/đặt sân",
                formatCurrency(stats.bookings.avgValue),
                "",
                "",
                "",
                stats.bookings.avgValue > 100000
                    ? "💎 Giá trị cao"
                    : "📊 Bình thường",
            ],
            ["", "", "", "", "", ""],

            // Phần khách hàng
            ["👥 THỐNG KÊ KHÁCH HÀNG", "", "", "", "", ""],
            ["Chỉ số", "Số lượng", "Tỷ lệ", "Xu hướng", "", ""],
            [
                "🏢 Tổng khách hàng",
                stats.customers.total.toString(),
                "100%",
                "📊 Tổng thể",
                "",
                "",
            ],
            [
                "✅ Khách hàng hoạt động",
                stats.customers.active.toString(),
                `${(
                    (stats.customers.active / stats.customers.total) *
                    100
                ).toFixed(1)}%`,
                stats.customers.active > stats.customers.total * 0.7
                    ? "🟢 Tốt"
                    : "🟡 Trung bình",
                "",
                "",
            ],
            [
                "🆕 Khách hàng mới",
                stats.customers.new.toString(),
                `${(
                    (stats.customers.new / stats.customers.total) *
                    100
                ).toFixed(1)}%`,
                stats.customers.new > 0 ? "📈 Có tăng trường" : "📊 Ổn định",
                "",
                "",
            ],
            [
                "🔄 Tỷ lệ giữ chân",
                `${stats.customers.retention.toFixed(2)}%`,
                "",
                stats.customers.retention > 80
                    ? "🏆 Xuất sắc"
                    : stats.customers.retention > 60
                    ? "👍 Tốt"
                    : "⚠️ Cần cải thiện",
                "",
                "",
            ],
            ["", "", "", "", "", ""],

            // Phần sân thể thao
            ["🏟️ THỐNG KÊ SÂN THỂ THAO", "", "", "", "", ""],
            ["Chỉ số", "Giá trị", "Hiệu quả", "Đánh giá", "", ""],
            [
                "🏢 Tổng số sân",
                stats.courts.totalCourts.toString(),
                "",
                "📊 Cơ sở vật chất",
                "",
                "",
            ],
            [
                "📊 Tỷ lệ sử dụng TB",
                `${stats.courts.avgUtilization.toFixed(2)}%`,
                "",
                stats.courts.avgUtilization > 70
                    ? "🟢 Hiệu quả cao"
                    : stats.courts.avgUtilization > 50
                    ? "🟡 Bình thường"
                    : "🔴 Thấp",
                "",
                "",
            ],
            [
                "🏆 Sân hiệu quả nhất",
                stats.courts.topPerformer,
                "",
                "⭐ Sân xuất sắc",
                "",
                "",
            ],
        ];

        const ws = XLSX.utils.aoa_to_sheet(overviewData);

        // Áp dụng styles
        applyOverviewStyles(ws, overviewData.length);

        XLSX.utils.book_append_sheet(wb, ws, "📊 Tổng quan");
    };

    // Tạo sheet khách hàng
    const createCustomerSheet = (
        wb: XLSX.WorkBook,
        customers: CustomerData[]
    ) => {
        const customerSheetData = [
            ["", "", "", "", "", "", ""],
            ["", "", "👥 TOP KHÁCH HÀNG TIỀM NĂNG", "", "", "", ""],
            ["", "", "Khách hàng có giá trị cao nhất", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            [
                "STT",
                "👤 Tên đăng nhập",
                "📝 Họ và tên",
                "📧 Email",
                "🔢 Lượt đặt",
                "💰 Tổng chi tiêu",
                "📅 Lần đặt cuối",
            ],
        ];

        customers.forEach((customer, index) => {
            const rank = index + 1;
            let rankIcon = "🥉";
            if (rank === 1) rankIcon = "🥇";
            else if (rank === 2) rankIcon = "🥈";
            else if (rank <= 3) rankIcon = "🥉";
            else if (rank <= 5) rankIcon = "⭐";
            else rankIcon = "👤";

            customerSheetData.push([
                `${rankIcon} ${rank}`,
                customer.customer.username,
                customer.customer.fullname || "N/A",
                customer.customer.email,
                `${customer.bookingCount} lượt`,
                formatCurrency(customer.totalSpent),
                formatDate(customer.lastBooking),
            ]);
        });

        customerSheetData.push(["", "", "", "", "", "", ""]);
        customerSheetData.push([
            `📈 Tổng khách hàng: ${customers.length}`,
            "",
            "",
            "",
            "",
            `💰 Tổng doanh thu: ${formatCurrency(
                customers.reduce((sum, c) => sum + c.totalSpent, 0)
            )}`,
            "",
        ]);

        const ws = XLSX.utils.aoa_to_sheet(customerSheetData);
        applyCustomerStyles(ws, customerSheetData.length);
        XLSX.utils.book_append_sheet(wb, ws, "👥 Top khách hàng");
    };

    // Tạo sheet thống kê sân
    const createCourtSheet = (wb: XLSX.WorkBook, courts: CourtUsageData[]) => {
        const courtSheetData = [
            ["", "", "", "", "", "", "", ""],
            ["", "", "🏟️ THỐNG KÊ HIỆU QUẢ SÂN THỂ THAO", "", "", "", "", ""],
            [
                "",
                "",
                "Phân tích mức độ sử dụng và doanh thu",
                "",
                "",
                "",
                "",
                "",
            ],
            ["", "", "", "", "", "", "", ""],
            [
                "STT",
                "🏷️ Mã sân",
                "🏟️ Tên sân",
                "🎯 Loại sân",
                "📊 Lượt đặt",
                "💰 Doanh thu",
                "⚡ Tỷ lệ sử dụng",
                "⏱️ Thời gian TB (phút)",
            ],
        ];

        courts.forEach((court, index) => {
            const utilizationRate = court.utilizationRate;
            let performanceIcon = "🔴";
            if (utilizationRate > 80) performanceIcon = "🟢";
            else if (utilizationRate > 60) performanceIcon = "🟡";
            else if (utilizationRate > 40) performanceIcon = "🟠";

            courtSheetData.push([
                `${index + 1}`,
                court.court.code,
                court.court.name,
                court.court.type_name || "N/A",
                `${court.bookingCount} lượt`,
                formatCurrency(court.revenue),
                `${performanceIcon} ${utilizationRate.toFixed(1)}%`,
                `${court.averageBookingDuration.toFixed(0)} phút`,
            ]);
        });

        courtSheetData.push(["", "", "", "", "", "", "", ""]);
        courtSheetData.push([
            `🏟️ Tổng sân: ${courts.length}`,
            "",
            "",
            "",
            `📊 Tổng lượt đặt: ${courts.reduce(
                (sum, c) => sum + c.bookingCount,
                0
            )}`,
            `💰 Tổng doanh thu: ${formatCurrency(
                courts.reduce((sum, c) => sum + c.revenue, 0)
            )}`,
            `⚡ TB sử dụng: ${(
                courts.reduce((sum, c) => sum + c.utilizationRate, 0) /
                courts.length
            ).toFixed(1)}%`,
            "",
        ]);

        const ws = XLSX.utils.aoa_to_sheet(courtSheetData);
        applyCourtStyles(ws, courtSheetData.length);
        XLSX.utils.book_append_sheet(wb, ws, "🏟️ Thống kê sân");
    };

    // Tạo biểu đồ doanh thu
    const createRevenueChart = (
        wb: XLSX.WorkBook,
        revenueData: Array<{ date: string; revenue: number }>
    ) => {
        const chartData = [
            ["", "", "", ""],
            ["", "📈 XU HƯỚNG DOANH THU", "", ""],
            ["", "Biểu đồ doanh thu theo thời gian", "", ""],
            ["", "", "", ""],
            ["📅 Ngày", "💰 Doanh thu", "📊 Xu hướng", "💡 Ghi chú"],
        ];

        revenueData.forEach((item, index) => {
            const currentRevenue = item.revenue;
            const prevRevenue =
                index > 0 ? revenueData[index - 1].revenue : currentRevenue;
            const trend =
                currentRevenue > prevRevenue
                    ? "📈 Tăng"
                    : currentRevenue < prevRevenue
                    ? "📉 Giảm"
                    : "➡️ Ổn định";
            const note =
                currentRevenue > 1000000
                    ? "🎯 Ngày tốt"
                    : currentRevenue > 500000
                    ? "👍 Bình thường"
                    : "⚠️ Thấp";

            chartData.push([
                formatDate(item.date),
                formatCurrency(currentRevenue),
                trend,
                note,
            ]);
        });

        const totalRevenue = revenueData.reduce(
            (sum, item) => sum + item.revenue,
            0
        );
        const avgRevenue = totalRevenue / revenueData.length;
        const maxRevenue = Math.max(...revenueData.map((item) => item.revenue));
        const minRevenue = Math.min(...revenueData.map((item) => item.revenue));

        chartData.push(["", "", "", ""]);
        chartData.push(["📊 Thống kê tổng hợp:", "", "", ""]);
        chartData.push([
            `💰 Tổng doanh thu: ${formatCurrency(totalRevenue)}`,
            "",
            "",
            "",
        ]);
        chartData.push([
            `📊 Doanh thu TB: ${formatCurrency(avgRevenue)}`,
            "",
            "",
            "",
        ]);
        chartData.push([
            `🏆 Cao nhất: ${formatCurrency(maxRevenue)}`,
            "",
            "",
            "",
        ]);
        chartData.push([
            `📉 Thấp nhất: ${formatCurrency(minRevenue)}`,
            "",
            "",
            "",
        ]);

        const ws = XLSX.utils.aoa_to_sheet(chartData);
        applyChartStyles(ws, chartData.length);
        XLSX.utils.book_append_sheet(wb, ws, "📈 Doanh thu");
    };

    // Tạo biểu đồ đặt sân
    const createBookingChart = (
        wb: XLSX.WorkBook,
        bookingData: Array<{ date: string; bookings: number }>
    ) => {
        const chartData = [
            ["", "", "", ""],
            ["", "📋 XU HƯỚNG ĐẶT SÂN", "", ""],
            ["", "Biểu đồ lượt đặt sân theo thời gian", "", ""],
            ["", "", "", ""],
            ["📅 Ngày", "📋 Lượt đặt", "📊 Xu hướng", "💡 Đánh giá"],
        ];

        bookingData.forEach((item, index) => {
            const currentBookings = item.bookings;
            const prevBookings =
                index > 0 ? bookingData[index - 1].bookings : currentBookings;
            const trend =
                currentBookings > prevBookings
                    ? "📈 Tăng"
                    : currentBookings < prevBookings
                    ? "📉 Giảm"
                    : "➡️ Ổn định";
            const rating =
                currentBookings > 20
                    ? "🎯 Cao"
                    : currentBookings > 10
                    ? "👍 Trung bình"
                    : "⚠️ Thấp";

            chartData.push([
                formatDate(item.date),
                `${currentBookings} lượt`,
                trend,
                rating,
            ]);
        });

        const totalBookings = bookingData.reduce(
            (sum, item) => sum + item.bookings,
            0
        );
        const avgBookings = totalBookings / bookingData.length;
        const maxBookings = Math.max(
            ...bookingData.map((item) => item.bookings)
        );
        const minBookings = Math.min(
            ...bookingData.map((item) => item.bookings)
        );

        chartData.push(["", "", "", ""]);
        chartData.push(["📊 Thống kê tổng hợp:", "", "", ""]);
        chartData.push([`📋 Tổng lượt đặt: ${totalBookings}`, "", "", ""]);
        chartData.push([
            `📊 Lượt đặt TB: ${avgBookings.toFixed(1)}`,
            "",
            "",
            "",
        ]);
        chartData.push([`🏆 Cao nhất: ${maxBookings} lượt`, "", "", ""]);
        chartData.push([`📉 Thấp nhất: ${minBookings} lượt`, "", "", ""]);

        const ws = XLSX.utils.aoa_to_sheet(chartData);
        applyChartStyles(ws, chartData.length);
        XLSX.utils.book_append_sheet(wb, ws, "📋 Lượt đặt sân");
    };

    // Áp dụng styles cho sheet tổng quan
    const applyOverviewStyles = (ws: XLSX.WorkSheet, totalRows: number) => {
        // Style cho tiêu đề chính
        const mainTitleStyle: CellStyle = {
            font: { bold: true, sz: 18, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2E7D3A" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        // Style cho tiêu đề phụ
        const subTitleStyle: CellStyle = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4A90A4" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        // Style cho header section
        const sectionHeaderStyle: CellStyle = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "5A67D8" } },
            alignment: { horizontal: "left", vertical: "center" },
            border: getBorder(),
        };

        // Style cho header bảng
        const tableHeaderStyle: CellStyle = {
            font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4C51BF" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        // Style cho dữ liệu
        const dataStyle: CellStyle = {
            font: { sz: 10 },
            alignment: { horizontal: "left", vertical: "center" },
            border: getBorder(),
        };

        // Áp dụng styles
        setCellStyle(ws, 1, 2, mainTitleStyle); // Tiêu đề chính
        setCellStyle(ws, 2, 2, subTitleStyle); // Tiêu đề phụ

        // Headers sections
        setCellStyle(ws, 7, 0, sectionHeaderStyle);
        setCellStyle(ws, 14, 0, sectionHeaderStyle);
        setCellStyle(ws, 21, 0, sectionHeaderStyle);

        // Table headers
        for (let col = 0; col < 6; col++) {
            setCellStyle(ws, 8, col, tableHeaderStyle);
            setCellStyle(ws, 15, col, tableHeaderStyle);
            setCellStyle(ws, 22, col, tableHeaderStyle);
        }

        // Data rows
        for (let row = 9; row < totalRows; row++) {
            for (let col = 0; col < 6; col++) {
                if (ws[XLSX.utils.encode_cell({ r: row, c: col })]) {
                    setCellStyle(ws, row, col, dataStyle);
                }
            }
        }

        // Merge cells và column widths
        ws["!merges"] = [
            { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
            { s: { r: 7, c: 0 }, e: { r: 7, c: 5 } },
            { s: { r: 14, c: 0 }, e: { r: 14, c: 5 } },
            { s: { r: 21, c: 0 }, e: { r: 21, c: 5 } },
        ];

        ws["!cols"] = [
            { wch: 25 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 25 },
        ];
    };

    // Áp dụng styles cho sheet khách hàng
    const applyCustomerStyles = (ws: XLSX.WorkSheet, totalRows: number) => {
        const titleStyle: CellStyle = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "E53E3E" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        const headerStyle: CellStyle = {
            font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3182CE" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        // Áp dụng styles
        setCellStyle(ws, 1, 2, titleStyle);
        for (let col = 0; col < 7; col++) {
            setCellStyle(ws, 4, col, headerStyle);
        }

        // Data styles với màu xen kẽ
        for (let row = 5; row < totalRows - 2; row++) {
            const isEvenRow = (row - 5) % 2 === 0;
            const rowStyle: CellStyle = {
                font: { sz: 10 },
                fill: { fgColor: { rgb: isEvenRow ? "F7FAFC" : "FFFFFF" } },
                alignment: { horizontal: "left", vertical: "center" },
                border: getBorder(),
            };

            for (let col = 0; col < 7; col++) {
                setCellStyle(ws, row, col, rowStyle);
            }
        }

        ws["!merges"] = [
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
        ];

        ws["!cols"] = [
            { wch: 8 },
            { wch: 15 },
            { wch: 20 },
            { wch: 25 },
            { wch: 12 },
            { wch: 18 },
            { wch: 15 },
        ];
    };

    // Áp dụng styles cho sheet sân
    const applyCourtStyles = (ws: XLSX.WorkSheet, totalRows: number) => {
        const titleStyle: CellStyle = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "38A169" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        const headerStyle: CellStyle = {
            font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "319795" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        setCellStyle(ws, 1, 2, titleStyle);
        for (let col = 0; col < 8; col++) {
            setCellStyle(ws, 4, col, headerStyle);
        }

        // Data styles
        for (let row = 5; row < totalRows - 2; row++) {
            const isEvenRow = (row - 5) % 2 === 0;
            const rowStyle: CellStyle = {
                font: { sz: 10 },
                fill: { fgColor: { rgb: isEvenRow ? "F0FFF4" : "FFFFFF" } },
                alignment: { horizontal: "left", vertical: "center" },
                border: getBorder(),
            };

            for (let col = 0; col < 8; col++) {
                setCellStyle(ws, row, col, rowStyle);
            }
        }

        ws["!merges"] = [
            { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
        ];

        ws["!cols"] = [
            { wch: 6 },
            { wch: 10 },
            { wch: 20 },
            { wch: 15 },
            { wch: 12 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
        ];
    };

    // Áp dụng styles cho biểu đồ
    const applyChartStyles = (ws: XLSX.WorkSheet, totalRows: number) => {
        const titleStyle: CellStyle = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "805AD5" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        const headerStyle: CellStyle = {
            font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "9F7AEA" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: getBorder(),
        };

        setCellStyle(ws, 1, 1, titleStyle);
        for (let col = 0; col < 4; col++) {
            setCellStyle(ws, 4, col, headerStyle);
        }

        // Data styles
        for (let row = 5; row < totalRows; row++) {
            for (let col = 0; col < 4; col++) {
                const rowStyle: CellStyle = {
                    font: { sz: 10 },
                    alignment: { horizontal: "left", vertical: "center" },
                    border: getBorder(),
                };
                setCellStyle(ws, row, col, rowStyle);
            }
        }

        ws["!merges"] = [
            { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
        ];

        ws["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];
    };

    // Utility functions
    const setBorder = () => ({
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
    });

    const getBorder = () => setBorder();

    const setCellStyle = (
        ws: XLSX.WorkSheet,
        row: number,
        col: number,
        style: CellStyle
    ) => {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) ws[cellAddress] = { v: "", t: "s" };
        ws[cellAddress].s = style;
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatDateFilename = (date: Date): string => {
        return date.toISOString().split("T")[0];
    };

    const getPeriodText = (
        period: string,
        isCustomDate: boolean,
        startDate?: string,
        endDate?: string
    ): string => {
        if (isCustomDate && startDate && endDate) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }

        switch (period) {
            case "today":
                return "Hôm nay";
            case "yesterday":
                return "Hôm qua";
            case "this_week":
                return "Tuần này";
            case "last_week":
                return "Tuần trước";
            case "this_month":
                return "Tháng này";
            case "last_month":
                return "Tháng trước";
            case "this_year":
                return "Năm này";
            case "last_year":
                return "Năm trước";
            default:
                return "Tất cả thời gian";
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={handleExport}
                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
            >
                <FileDown className="mr-2 h-4 w-4" />
                📊 Xuất Excel
            </Button>
        </div>
    );
}
