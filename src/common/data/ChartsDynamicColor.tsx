const getChartColorsArray = (colors: string | undefined): string[] => {
    if (!colors) {
        // console.error("Error: colors parameter is undefined or empty.");
        return [];
    }

    try {
        const parsedColors: string[] = JSON.parse(colors);
        return parsedColors.map(function (value: string) {
            var newValue = value.replace(" ", "");
            if (newValue.indexOf(",") === -1) {
                var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
                if (color.indexOf("#") !== -1) color = color.replace(" ", "");
                return color || newValue;
            } else {
                var val = value.split(',');
                if (val.length === 2) {
                    var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
                    return `rgba(${rgbaColor},${val[1]})`;
                } else {
                    return newValue;
                }
            }
        });
    } catch (error) {
        // console.error("Error parsing colors JSON:", error);
        return [];
    }
};

export default getChartColorsArray;
