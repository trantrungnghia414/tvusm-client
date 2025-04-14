"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const timeSlots = [
    "07:00 - 09:00",
    "09:00 - 11:00",
    "13:00 - 15:00",
    "15:00 - 17:00",
    "17:00 - 19:00",
    "19:00 - 21:00",
];

const courts = {
    volleyball: [
        { id: 1, name: "Sân bóng chuyền 1" },
        { id: 2, name: "Sân bóng chuyền 2" },
    ],
    badminton: [
        { id: 3, name: "Sân cầu lông 1" },
        { id: 4, name: "Sân cầu lông 2" },
        { id: 5, name: "Sân cầu lông 3" },
        { id: 6, name: "Sân cầu lông 4" },
    ],
};

export function BookingForm() {
    const [courtType, setCourtType] = useState("volleyball");
    const [date, setDate] = useState<Date>();
    const [selectedCourt, setSelectedCourt] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Đặt sân thể thao
                </CardTitle>
                <CardDescription className="text-center">
                    Chọn loại sân, thời gian và điền thông tin để đặt sân
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <Tabs value={courtType} onValueChange={setCourtType}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="volleyball">
                            Sân bóng chuyền
                        </TabsTrigger>
                        <TabsTrigger value="badminton">
                            Sân cầu lông
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="volleyball" className="space-y-4">
                        <div>
                            <Label>Chọn sân</Label>
                            <Select
                                value={selectedCourt}
                                onValueChange={setSelectedCourt}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn sân bóng chuyền" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courts.volleyball.map((court) => (
                                        <SelectItem
                                            key={court.id}
                                            value={court.id.toString()}
                                        >
                                            {court.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    <TabsContent value="badminton" className="space-y-4">
                        <div>
                            <Label>Chọn sân</Label>
                            <Select
                                value={selectedCourt}
                                onValueChange={setSelectedCourt}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn sân cầu lông" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courts.badminton.map((court) => (
                                        <SelectItem
                                            key={court.id}
                                            value={court.id.toString()}
                                        >
                                            {court.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label>Chọn ngày</Label>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            disabled={(date) => date < new Date()}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Chọn giờ</Label>
                            <Select
                                value={selectedTime}
                                onValueChange={setSelectedTime}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn khung giờ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedCourt && date && selectedTime && (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Thông tin đặt sân
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p>
                                        <span className="font-medium">
                                            Sân:{" "}
                                        </span>
                                        {
                                            courts[
                                                courtType as keyof typeof courts
                                            ].find(
                                                (c) =>
                                                    c.id.toString() ===
                                                    selectedCourt
                                            )?.name
                                        }
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Ngày:{" "}
                                        </span>
                                        {date.toLocaleDateString("vi-VN", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Giờ:{" "}
                                        </span>
                                        {selectedTime}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                <Button className="w-full" size="lg">
                    Xác nhận đặt sân
                </Button>
            </CardContent>
        </Card>
    );
}
