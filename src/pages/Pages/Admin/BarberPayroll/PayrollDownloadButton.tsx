import { PDFDownloadLink } from "@react-pdf/renderer";
import PayrollPDF from "./PayrollPDF";
import { Spinner } from "reactstrap";
import { useRef, useState } from "react";
import { formatDate } from "Components/Common/DateUtil";

const PayrollDownloadButton = ({
  payrollData,
  isReady,
  selectedSalonInfo,
  selectedStartDate,
  selectedEndDate,
}: {
  payrollData: any[];
  isReady: boolean;
  selectedSalonInfo: any;
  selectedStartDate: string;
  selectedEndDate: string;
}) => {
  const [loading, setLoading] = useState(false);
  const downloadRef = useRef<HTMLAnchorElement | null>(null);

  const handleDownload = () => {
    if (downloadRef.current) {
      setLoading(true);
      setTimeout(() => {
        downloadRef.current?.click();
        setLoading(false);
      }, 500); // Delay to allow PDF generation
    }
  };

  return (
    <>
      {/* Main Button to Trigger PDF Download */}
      <button
        className="btn btn-primary"
        onClick={handleDownload}
        disabled={!isReady || loading}
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" /> Generating PDF...
          </>
        ) : (
          "Download PDF"
        )}
      </button>

      {/* Hidden PDFDownloadLink - Always Present */}
      <PDFDownloadLink
        document={
          <PayrollPDF
            payrollData={payrollData}
            selectedSalonInfo={selectedSalonInfo || { name: "N/A" }}
            selectedStartDate={
              selectedStartDate ? formatDate(selectedStartDate) : "N/A"
            }
            selectedEndDate={
              selectedEndDate ? formatDate(selectedEndDate) : "N/A"
            }
          />
        }
        fileName="payroll-report.pdf"
      >
        {({ loading: pdfLoading, url }) => (
          <a
            href={url || "#"}
            ref={downloadRef}
            style={{ display: "none" }} // Hide the link
            download="payroll-report.pdf"
          >
            Hidden Link
          </a>
        )}
      </PDFDownloadLink>
    </>
  );
};

export default PayrollDownloadButton;
