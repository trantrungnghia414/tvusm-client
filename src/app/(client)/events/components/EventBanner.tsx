import React from "react";

export default function EventBanner() {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Sự kiện thể thao
                </h1>
                <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
                    Khám phá và tham gia các sự kiện thể thao hấp dẫn tại các
                    nhà thi đấu của chúng tôi
                </p>
            </div>
        </div>
    );
}
