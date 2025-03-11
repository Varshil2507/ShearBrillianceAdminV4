import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../../../../Components/Common/ChartsDynamicColor";
import { APIClient } from "../../../../../Services/api_helper"; // Adjust the path
import { toast, ToastContainer } from "react-toastify";
import Loader from "Components/Common/Loader";

const apiClient = new APIClient();

const Basic = ({ dataColors }: any) => {
  const [topServices, setTopServices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    setShowLoader(true);
    // Fetch API data on component mount
    const fetchTopServices = async () => {
      try {
        const response: any = await apiClient.get("sales/gettopService");

        // Ensure the response has the correct structure
        if (response) {
          setTopServices(response); // Update state with the 'data' from API response
          const timer = setTimeout(() => {
            setShowLoader(false);
          }, 500); // Hide loader after 5 seconds
          return () => clearTimeout(timer); // Clear timer if component unmounts or salonData changes
        }
      } catch (error: any) {
        setShowLoader(false);
        // Check if the error has a response property (Axios errors usually have this)
        if (error.response && error.response.data) {
          const apiMessage = error.response.data.message; // Extract the message from the response
          toast.error(apiMessage || "An error occurred"); // Show the error message in a toaster
        } else {
          // Fallback for other types of errors
          toast.error(error.message || "Something went wrong");
        }
        setError(error);
      }
    };

    fetchTopServices();
  }, []);

  const BasicColors = getChartColorsArray(dataColors);

  // Ensure topServices is not empty before trying to map over it
  const appointment = [
    {
      name: "Total Appointments",
      data: topServices.map((service: any) => parseInt(service.usageCount)), // Use usageCount for data
    },
  ];

  const options: any = {
    chart: {
      toolbar: {
        show: !1,
      },
    },
    plotOptions: {
      bar: {
        horizontal: !0,
      },
    },
    dataLabels: {
      enabled: !1,
    },
    colors: BasicColors,
    grid: {
      borderColor: "#f1f1f1",
    },
    xaxis: {
      categories: topServices.map((service: any) => service.serviceName), // Use serviceName for categories
    },
  };

  return (
    <React.Fragment>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <> {showLoader && (
          <Loader />
        )}
          <ReactApexChart
            dir="ltr"
            className="apex-charts"
            options={options}
            series={appointment}
            type="bar"
            height={350}
          />
          {/* <div>
            <h4>API Data:</h4>
            <pre>{JSON.stringify(topServices, null, 2)}</pre>
          </div> */}
        </>
      )}

      <ToastContainer closeButton={false} limit={1} />
    </React.Fragment>
  );
};

export { Basic };
