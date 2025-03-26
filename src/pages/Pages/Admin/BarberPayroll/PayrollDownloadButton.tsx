import { PDFDownloadLink } from "@react-pdf/renderer";
import { Spinner } from "reactstrap"; // Ensure you import Spinner from your UI library
import PayrollPDF from "./PayrollPDF"; // Your PDF Component
import { useState } from "react";
import { formatDate } from "Components/Common/DateUtil";

const PayrollDownloadButton = ({ payrollData, selectedSalonInfo,
    selectedStartDate,
    selectedEndDate, }: {
        payrollData: any[], selectedSalonInfo: any;
        selectedStartDate: string;
        selectedEndDate: string;
    }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true); // Show spinner

        // Set a timeout to stop loading after 3 seconds (or any duration you want)
        setTimeout(() => {
            setLoading(false); // Hide spinner
        }, 3000);
    };

    return (
        <PDFDownloadLink
            document={<PayrollPDF payrollData={payrollData}
                selectedSalonInfo={selectedSalonInfo || { name: "N/A" }}
                selectedStartDate={selectedStartDate ? formatDate(selectedStartDate) : "N/A"}
                selectedEndDate={selectedEndDate ? formatDate(selectedEndDate) : "N/A"} />}
            fileName="payroll-report.pdf"
        >
            {({ loading: pdfLoading }) => (
                <button
                    className="btn btn-primary mb-3"
                    onClick={handleClick}
                    disabled={loading || pdfLoading}
                >
                    {loading || pdfLoading ? (
                        <>
                            <Spinner size="sm" className="me-2" /> Generating PDF...
                        </>
                    ) : (
                        "Download PDF"
                    )}
                </button>
            )}
        </PDFDownloadLink>
    );
};

export default PayrollDownloadButton;