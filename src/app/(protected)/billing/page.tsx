import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PriceTableOne from "@/components/price-table/PriceTableOne";

export default function BillingPage() {
    return (
        <>
        <PageBreadcrumb pageTitle="Suscripciones" />
        <ComponentCard title="Planes disponibles">
            {/* <BillingTable /> */}
            <PriceTableOne />
        </ComponentCard>
        </>
    )
}