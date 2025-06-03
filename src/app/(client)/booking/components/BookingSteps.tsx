import { Check } from "lucide-react";

interface BookingStepsProps {
    currentStep: number;
}

export default function BookingSteps({ currentStep }: BookingStepsProps) {
    const steps = [
        { id: 1, label: "Chọn sân & thời gian" },
        { id: 2, label: "Thông tin liên hệ" },
        { id: 3, label: "Xác nhận đặt sân" },
        { id: 4, label: "Hoàn tất" },
    ];

    return (
        <div className="w-full py-4">
            <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className="flex flex-col items-center relative"
                    >
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${
                  currentStep > step.id
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-500"
              }`}
                        >
                            {currentStep > step.id ? (
                                <Check className="h-5 w-5" />
                            ) : (
                                <span>{step.id}</span>
                            )}
                        </div>

                        <p
                            className={`mt-2 text-xs md:text-sm font-medium text-center
              ${
                  currentStep === step.id
                      ? "text-blue-600"
                      : currentStep > step.id
                      ? "text-green-600"
                      : "text-gray-500"
              }`}
                        >
                            {step.label}
                        </p>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="hidden md:block absolute top-5 left-full w-full h-0.5 transform -translate-y-1/2">
                                <div
                                    className={`h-full ${
                                        currentStep > step.id
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                    }`}
                                    style={{ width: "calc(100% - 2.5rem)" }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
