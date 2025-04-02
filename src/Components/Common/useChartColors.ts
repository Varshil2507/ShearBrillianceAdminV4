import { useEffect, useState } from 'react';
import getChartColorsArray from '../../Components/Common/ChartsDynamicColor';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { showErrorToast } from 'slices/layouts/toastService';

const useChartColors = (chartId: string) => {
  const [chartColors, setChartColors] = useState<string[]>([]);

  // Selector to access Layout state
  const selectLayoutState = (state: any) => state.Layout || {}; // Fallback to an empty object if Layout is undefined
  const selectLayoutProperties = createSelector(
    selectLayoutState,
    (layout: any) => ({
      layoutThemeType: layout?.layoutThemeType || 'default', // Provide a default fallback
      layoutThemeColorType: layout?.layoutThemeColorType || 'default', // Provide a default fallback
    })
  );

  // Extract properties from the Redux store
  const { layoutThemeType, layoutThemeColorType } = useSelector(selectLayoutProperties);

  useEffect(() => {
    try {
      // Ensure getChartColorsArray returns a valid array
      const colors = getChartColorsArray(chartId);
      if (Array.isArray(colors)) {
        setChartColors(colors);
      } else {
        console.error('getChartColorsArray did not return an array:', colors);
        setChartColors([]); // Fallback to an empty array
      }
    } catch (error: any) {
      // Error handling
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message;
        showErrorToast(apiMessage || "An error occurred");
      } else {
        showErrorToast(error.message || "Something went wrong");
      }
      setChartColors([]); // Fallback to an empty array on error
    }
  }, [chartId, layoutThemeType, layoutThemeColorType]);

  return chartColors;
};

export default useChartColors;

