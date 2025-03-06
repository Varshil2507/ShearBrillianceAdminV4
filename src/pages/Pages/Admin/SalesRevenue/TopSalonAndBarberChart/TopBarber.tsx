import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../../../../Components/Common/ChartsDynamicColor";
import { fetchTopBarber } from "Services/Sales"; // Import API method
import { toast, ToastContainer } from "react-toastify";

const TopBarber = ({ dataColors }: any) => {
  const [barberData, setBarberData] = useState<{
    names: string[];
    counts: number[];
    salons: string[];
    backgroundColors: string[];
  }>({
    names: [],
    counts: [],
    salons: [],
    backgroundColors: [],
  });

  useEffect(() => {
    const getTopBarbers = async () => {
      try {
        const topBarbers = await fetchTopBarber(); // Call the API function
        if (topBarbers.length > 0) {
          const names = topBarbers.map((barber: any) => barber.barberName);
          const counts = topBarbers.map((barber: any) => Number(barber.appointmentsCount)); // Convert to number
          const salons = topBarbers.map((barber: any) => barber.salonName);
          const backgroundColors = topBarbers.map((barber: any) => barber.backgroundColor); // Get colors

          setBarberData({ names, counts, salons, backgroundColors });
        } else {
          toast.error("No top barbers found");
        }
      } catch (error) {
        toast.error("Error fetching top barbers");
      }
    };

    getTopBarbers();
  }, []);

  // 🔹 Series Data: Display Salon Name and Barber Name
  const series = [
    {
      name:"Appointments",
      data: barberData.counts.map((count, index) => ({
        x: barberData.names[index], // Only Barber Name for X-axis
        y: count, // Appointments Count
        meta: barberData.salons[index], // Store Salon Name for Tooltip
      })),
    },
  ];
  
  const options: any = {
    chart: {
      height: 350,
      type: "bar",
    },
    colors: barberData.backgroundColors, // Ensure colors are applied correctly
    plotOptions: {
      bar: {
        columnWidth: "45%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: barberData.names, // Show only barber names
      labels: {
        style: {
          colors: barberData.backgroundColors,
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (value: any, { dataPointIndex }: any) {
          return `${value}(${barberData.salons[dataPointIndex]})`;
        },
      },
    },
  };
  

  return (
    <>
      <ToastContainer />
      <ReactApexChart dir="ltr" className="apex-charts" series={series} options={options} type="bar" height={350} />
    </>
  );
};

export { TopBarber };
