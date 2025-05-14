import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fetchAppointmentSalesData } from '../../../../Services/Sales'; // Adjust path
//import { BalanceOverviewCharts } from './DashboardCrmCharts'; // Adjust path
import Chart from 'react-apexcharts';
import { showErrorToast } from 'slices/layouts/toastService';

interface BalanceOverviewChartsProps {
  series: { name: string; data: number[] }[];
  categories: string[];
  chartId: string;
}

export const BalanceOverviewCharts: React.FC<BalanceOverviewChartsProps> = ({
  series = [],
  categories = [],
  chartId,
}) => {
  if (!series.length || !categories.length) {
    console.warn("Chart data is empty, skipping render.");
    return <p>No data available</p>;
  }

  const chartOptions = {
    chart: {
      id: chartId,
      type: "line",
    },
    xaxis: {
      type: "datetime", // Ensure ApexCharts understands date format
      categories,
    },
    yaxis: {
      title: {
        text: "Values",
      },
    },
    stroke: {
      curve: "smooth",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  return <Chart options={chartOptions} series={series} type="line" height={350} />;
};

// Define the type for the state
interface SalesDataItem {
  date: string;
  appointments: number;
  revenue: any;
}

interface DashboardCRMState {
  balanceOverviewData: SalesDataItem[];
  sales: number;
  appointments: number;
  profitRatio: number;
  filter: string;
}

// Redux Slice
const dashboardCRMSlice = createSlice({
  name: 'DashboardCRM',
  initialState: {
    balanceOverviewData: [],
    sales: 0,
    appointments: 0,
    profitRatio: 0,
    filter: 'last_7_days',
  } as DashboardCRMState,
  reducers: {
    updateBalanceOverviewData(state, action: PayloadAction<SalesDataItem[]>) {
      state.balanceOverviewData = [...action.payload];
    },
    updateMetrics(
      state,
      action: PayloadAction<{ sales: number; appointments: number; profitRatio: number }>
    ) {
      const { sales, appointments, profitRatio } = action.payload;
      state.sales = sales || 0;
      state.appointments = appointments || 0;
      state.profitRatio = profitRatio || 0;
    },
    updateFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload;
    },
  },
});

const { updateBalanceOverviewData, updateMetrics, updateFilter } = dashboardCRMSlice.actions;

// Thunk Logic
const getBalanceChartsData = (filter: string) => async (dispatch: any) => {
  try {
    const salesData: SalesDataItem[] = await fetchAppointmentSalesData(filter);

    if (salesData && Array.isArray(salesData)) {

      const totalSales = salesData.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
      const totalAppointments = salesData.reduce((sum, item) => sum + Number(item.appointments || 0), 0);
      const profitRatio = totalAppointments ? (totalSales / totalAppointments) * 100 : 0;

      dispatch(updateBalanceOverviewData([...salesData]));
      dispatch(updateMetrics({ sales: totalSales, appointments: totalAppointments, profitRatio }));
    } else {
      // console.error('Invalid sales data format or empty data');
      dispatch(updateBalanceOverviewData([]));
      dispatch(updateMetrics({ sales: 0, appointments: 0, profitRatio: 0 }));
    }
  } catch (error: any) {
    // Check if the error has a response property (Axios errors usually have this)
    if (error.response && error.response.data) {
      const apiMessage = error.response.data.message; // Extract the message from the response
      showErrorToast(apiMessage || "An error occurred"); // Show the error message in a toaster
    } else {
      // Fallback for other types of errors
      showErrorToast(error.message || "Something went wrong");
    }
    dispatch(updateBalanceOverviewData([]));
    dispatch(updateMetrics({ sales: 0, appointments: 0, profitRatio: 0 }));
  }
};

// Configure the Store
const store = configureStore({
  reducer: { DashboardCRM: dashboardCRMSlice.reducer },
});

// AppDispatch type to handle async thunks
type AppDispatch = typeof store.dispatch;

// Component
const BalanceOverview = () => {
  const dispatch: AppDispatch = useDispatch();
  const [chartData, setChartData] = useState<SalesDataItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('Last 7 Days');

  const { sales, appointments, profitRatio, balanceOverviewData } = useSelector(
    (state: any) => state.DashboardCRM
  );

  useEffect(() => {
    setChartData(JSON.parse(JSON.stringify(balanceOverviewData)));
  }, [balanceOverviewData]);

  const transformChartData = (data: SalesDataItem[]) => {
    if (!data || !Array.isArray(data)) {
      // console.error("Invalid chart data format", data);
      return { series: [], categories: [] };
    }
  
    const revenueData = data.map(item => (isNaN(Number(item.revenue)) ? 0 : Number(item.revenue)));
    const appointmentsData = data.map(item => (isNaN(Number(item.appointments)) ? 0 : Number(item.appointments)));
    const categories = data.map(item => item.date || "Unknown");
  
    return {
      series: [
        {
          name: "Revenue",
          data: revenueData, // Must be number[]
        },
        {
          name: "Appointments",
          data: appointmentsData, // Must be number[]
        },
      ],
      categories,
    };
  };

  const onChangeChartPeriod = (filter: string) => {
    setSelectedMonth(filter === 'last_7_days' ? 'Last 7 Days' : 'Last 30 Days');
    dispatch(updateFilter(filter));
    dispatch(getBalanceChartsData(filter));
  };

  useEffect(() => {
    dispatch(getBalanceChartsData('last_7_days'));
  }, [dispatch]);

  const userRole = localStorage.getItem('userRole');
  const storeRoleInfo = userRole ? JSON.parse(userRole) : {};

  return (
    <React.Fragment>
      {storeRoleInfo.role_name !== 'Barber' && (
        <Col xxl={12}>
          <Card className="card-height-100">
            <CardHeader className="align-items-center d-flex">
              <h4 className="card-title mb-0 flex-grow-1">Sales for appointment</h4>
              <div className="flex-shrink-0">
                <UncontrolledDropdown className="card-header-dropdown">
                  <DropdownToggle className="text-reset dropdown-btn" tag="a" role="button">
                    <span className="fw-semibold text-uppercase fs-12">Sort by: </span>
                    <span className="text-muted">
                      {selectedMonth}
                      <i className="mdi mdi-chevron-down ms-1"></i>
                    </span>
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-end">
                    <DropdownItem
                      onClick={() => onChangeChartPeriod('last_7_days')}
                      className={selectedMonth === 'Last 7 Days' ? 'active' : ''}
                    >
                      Last 7 Days
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => onChangeChartPeriod('last_30_days')}
                      className={selectedMonth === 'Last 30 Days' ? 'active' : ''}
                    >
                      Last 30 Days
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </CardHeader>
            <CardBody className="px-0">
              <ul className="list-inline main-chart text-center mb-0">
                <li className="list-inline-item chart-border-left me-0 border-0">
                  <h4 className="text-primary">
                    ${sales?.toLocaleString()}
                    <span className="text-muted d-inline-block fs-13 align-middle ms-2">Sales</span>
                  </h4>
                </li>
                <li className="list-inline-item chart-border-left me-0">
                  <h4>
                    {appointments?.toLocaleString()}
                    <span className="text-muted d-inline-block fs-13 align-middle ms-2">Appointments</span>
                  </h4>
                </li>
                <li className="list-inline-item chart-border-left me-0">
                  <h4>
                    {profitRatio?.toFixed(2)}%
                    <span className="text-muted d-inline-block fs-13 align-middle ms-2">Profit Ratio</span>
                  </h4>
                </li>
              </ul>
              <div dir="ltr">
                <BalanceOverviewCharts
                  series={transformChartData(chartData).series} // Passing transformed series data
                  categories={transformChartData(chartData).categories} // Passing categories for the x-axis
                  chartId="revenue-expenses-charts"
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      )}
    </React.Fragment>
  );
};

// App Component
const App = () => (
  <Provider store={store}>
    <BalanceOverview />
  </Provider>
);

export default App;
