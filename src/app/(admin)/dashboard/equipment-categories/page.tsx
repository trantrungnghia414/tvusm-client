import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import CategoryForm from "./components/CategoryForm";

export default function EquipmentCategoriesPage() {
    return (
        <DashboardLayout activeTab="equipments">
            <CategoryForm />
        </DashboardLayout>
    );
}
