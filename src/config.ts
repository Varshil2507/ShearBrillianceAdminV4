interface GoogleConfig {
  API_KEY: string;
  CLIENT_ID: string;
  SECRET: string;
}

interface FacebookConfig {
  APP_ID: string;
}

interface ApiConfig {
  API_URL: string;
  MAIN_API_URL: string;
}

interface CommonTextConfig {
  PROJECT_NAME: string;
}

interface Config {
  google: GoogleConfig;
  facebook: FacebookConfig;
  api: ApiConfig;
  commonText: CommonTextConfig;
}
// const API_MAIN_URL = "https://shear-brilliance-apiv2.onrender.com";
const API_MAIN_URL = "https://shearbrilliance-v4-api-payment.onrender.com";
const config: Config = {
  google: {
    API_KEY: "",
    CLIENT_ID: "",
    SECRET: "",
  },
  facebook: {
    APP_ID: "",
  },
  api: {
    MAIN_API_URL: API_MAIN_URL,
    API_URL: API_MAIN_URL + "/api"
  },
  commonText: {
    PROJECT_NAME: "Shear Brilliance"
  }
};
export default config;