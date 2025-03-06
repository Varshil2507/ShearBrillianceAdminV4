import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../../../../Components/Common/ChartsDynamicColor";
import { APIClient } from "../../../../../Services/api_helper"; 
import { toast, ToastContainer } from "react-toastify";
import { fetchTopSalon } from "Services/Sales";

const apiClient = new APIClient();

const TopSalon = ({ dataColors }: any) => {
    const [chartData, setChartData] = useState<{ name: string; data: number[] }[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const response = await fetchTopSalon();
                if (response) {
                    const data = response;

                    // Extracting salon names & appointment counts
                    const salonNames = data.map((salon: any) => salon.salonName);
                    const appointmentCounts = data.map((salon: any) => Number(salon.appointmentsCount));

                    setCategories(salonNames);
                    setChartData([{ name: "Appointments", data: appointmentCounts }]);
                } else {
                    toast.error("Failed to fetch salon data");
                }
            } catch (error) {
                toast.error("Error fetching salon data");
            }
        };

        fetchData();
    }, []);

    const chartColumnDatatalabelColors = getChartColorsArray(dataColors);

    const options = useMemo(() => ({
        chart: { type: "bar", toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: "50%" } },
        // dataLabels: {
        //     enabled: true,
        //     formatter: (val: any) => `${val} Appointments`,
        //     offsetY: -10,
        //     style: { fontSize: "12px", colors: ["#fff"] },
        // },
        colors: chartColumnDatatalabelColors,
        grid: { borderColor: "#04a6e9d9" },
        xaxis: {
            categories: categories, // ✅ This will now update properly
            labels: { offsetY: -2 },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: { title: { text: "Appointments" }, labels: { formatter: (val: any) => val.toFixed(0) } },
    }), [categories]);

    return (
        <>
            <ToastContainer />
            {chartData.length > 0 && categories.length > 0 && (
    <ReactApexChart className="apex-charts" series={chartData} options={options} type="bar" height={350} />
)}

        </>
    );
};

export { TopSalon };
