
import { showErrorToast } from "slices/layouts/toastService";

const getChartColorsArray = (colors: string): string[] => {
    try {
        let parsedColors: string[];

        // Try parsing colors as JSON if it looks like a JSON string
        if (colors && colors.startsWith('[') && colors.endsWith(']')) {
            parsedColors = JSON.parse(colors); // Parse if it's a valid JSON string
        } else {
            // Handle plain string or other types (e.g., color name or non-JSON)
            parsedColors = [colors]; // Wrap it in an array for further processing
        }

        return parsedColors.map(function (value: string) {
            var newValue = value.replace(" ", "");
            if (newValue.indexOf(",") === -1) {
                var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);

                if (color.indexOf("#") !== -1)
                    color = color.replace(" ", "");
                if (color) return color;
                else return newValue;
            } else {
                var val = value.split(',');
                if (val.length === 2) {
                    var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
                    rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
                    return rgbaColor;
                } else {
                    return newValue;
                }
            }
        });
    } catch (error: any) {
          // Error handling
      if (error.response && error.response.data) {
        const apiMessage = error.response.data.message;
        showErrorToast(apiMessage || "An error occurred");
      } else {
        showErrorToast(error.message || "Something went wrong");
      }
        return []; // Return an empty array or default value
    }
};

export default getChartColorsArray;
