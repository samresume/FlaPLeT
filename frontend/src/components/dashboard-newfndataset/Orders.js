import * as React from "react";
import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  InputLabel,
  MenuItem,
  FormHelperText,
  FormControl,
  Select,
  Backdrop,
  CircularProgress,
  Slider,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { grey, orange } from "@mui/material/colors";
import { Component } from "react";
import { withCookies } from "react-cookie";
import ReCAPTCHA from "react-google-recaptcha";

const theme = createTheme({
  typography: {
    fontSize: 12,
    fontFamily: "'Assistant', sans-serif",
  },
  palette: {
    primary: { main: grey[900] },
    secondary: { main: orange[400] },
  },
});

const pearsonMarks = [
  { value: -1, label: "-1" },
  { value: 0, label: "0" },
  { value: +1, label: "+1" },
];

class Orders extends Component {
  constructor(props) {
    super(props);

    const token = props.cookies.get("user-token");
    const access = props.cookies.get("access");

    if (token && access !== "1") {
      window.location.href = `${process.env.PUBLIC_URL}/access`;
    } else if (!token) {
      window.location.href = `${process.env.PUBLIC_URL}/login`;
    }

    this.state = {
      open: false,
      token,
      access,
      captchaResult: "",
      datasets: [],
      augmented_datasets: [],
      submitted: false,
      fieldErrors: {
        dataset_name: false,
        dataset_id: false,
      },
      backendError: "",
      experiment: {
        dataset_name: "",
        description: "",
        dataset_id: null,
        dataset: null,
        data: null,
        pearson: 0.5,
        max_neighbor: 8,
      },
    };
  }

  componentDidMount() {
    fetch("https://api.flaplet.org/solarflare/dataset/get_info", {
      method: "GET",
      headers: {
        Authorization: `Token ${this.state.token}`,
      },
    })
      .then((resp) => resp.json())
      .then((res) => this.setState({ datasets: res.data }));

    fetch("https://api.flaplet.org/solarflare/augmented-dataset/get_info", {
      method: "GET",
      headers: {
        Authorization: `Token ${this.state.token}`,
      },
    })
      .then((resp) => resp.json())
      .then((res) => this.setState({ augmented_datasets: res.data }));
  }

  handleRecaptcha = (value) => {
    fetch("https://api.flaplet.org/recaptcha/", {
      method: "POST",
      body: JSON.stringify({ captcha_value: value }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ captchaResult: data.captcha.success });
      });
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    const experiment = { ...this.state.experiment };

    if (name === "Data") {
      const [id, type] = value.split("-");
      experiment.dataset_id = id;
      experiment.dataset = type;
      experiment.data = value;
    } else {
      experiment[name] = value;
    }

    this.setState({ experiment });
  };

  handleSliderChange = (name, value) => {
    const experiment = { ...this.state.experiment };
    experiment[name] = value;
    this.setState({ experiment });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const {
      dataset_name,
      dataset_id,
      dataset,
      pearson,
      max_neighbor,
      description,
    } = this.state.experiment;

    const fieldErrors = {
      dataset_name: !dataset_name,
      dataset_id: !dataset_id,
    };

    const hasErrors = Object.values(fieldErrors).some(Boolean);
    this.setState({ fieldErrors, submitted: true, backendError: "" });

    if (hasErrors) {
      this.setState({ open: false });
      return;
    }

    const payload = {
      dataset_name,
      dataset_id,
      dataset,
      pearson,
      max_neighbor,
      description,
    };

    this.setState({ open: true });

    fetch("https://api.flaplet.org/solarflare/fn-dataset/set_info/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.state.token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((resp) => resp.json())
      .then((res) => {
        if (res.message === "success") {
          window.location.href = `${process.env.PUBLIC_URL}/graph-generation`;
        } else {
          this.setState({
            backendError: res.error || "Something went wrong.",
            open: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          backendError: "Server error. Please try again.",
          open: false,
        });
      });
  };

  render() {
    const {
      experiment,
      datasets,
      augmented_datasets,
      fieldErrors,
      submitted,
      backendError,
    } = this.state;

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <h2 className="h2">New Graph Generation</h2>
          <Box
            sx={{
              marginTop: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              component="form"
              onSubmit={this.handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                className="space"
                value={experiment.dataset_name}
                onChange={this.handleChange}
                margin="normal"
                required
                fullWidth
                id="dataset_name"
                label="Graph Name"
                name="dataset_name"
                error={submitted && fieldErrors.dataset_name}
              />

              <TextField
                className="space"
                value={experiment.description}
                onChange={this.handleChange}
                margin="normal"
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
              />

              <FormControl
                required
                className="space"
                fullWidth
                error={submitted && fieldErrors.dataset_id}
              >
                <InputLabel>Dataset</InputLabel>
                <Select
                  value={experiment.data || ""}
                  label="Dataset"
                  name="Data"
                  onChange={this.handleChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {datasets.map((row) =>
                    row.status === "completed" ? (
                      <MenuItem key={row.id} value={`${row.id}-dataset`}>
                        {row.dataset_name}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        disabled
                        key={row.id}
                        value={`${row.id}-dataset`}
                      >
                        {row.dataset_name}
                      </MenuItem>
                    )
                  )}
                  {augmented_datasets.length > 0 && <Divider />}
                  {augmented_datasets.map((row) =>
                    row.status === "completed" ? (
                      <MenuItem
                        key={row.id}
                        value={`${row.id}-augmented_dataset`}
                      >
                        {row.dataset_name}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        disabled
                        key={row.id}
                        value={`${row.id}-augmented_dataset`}
                      >
                        {row.dataset_name}
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>Select a dataset to proceed</FormHelperText>
              </FormControl>

              <Typography sx={{ mt: 4 }}>
                Pearson Correlation Threshold
              </Typography>
              <Slider
                name="pearson"
                value={experiment.pearson}
                onChange={(e, v) => this.handleSliderChange("pearson", v)}
                valueLabelDisplay="auto"
                step={0.05}
                marks={pearsonMarks}
                min={-1}
                max={1}
                sx={{ mb: 5 }}
              />

              <Typography>Maximum Number of Neighbors</Typography>
              <Slider
                name="max_neighbor"
                value={experiment.max_neighbor}
                onChange={(e, v) => this.handleSliderChange("max_neighbor", v)}
                valueLabelDisplay="auto"
                step={1}
                min={5}
                max={20}
                sx={{ mb: 2 }}
              />

              {submitted && Object.values(fieldErrors).some(Boolean) && (
                <FormHelperText error sx={{ mt: 2 }}>
                  Please fill out all required fields!
                </FormHelperText>
              )}

              {backendError && (
                <FormHelperText error sx={{ mt: 2 }}>
                  {backendError}
                </FormHelperText>
              )}

              <ReCAPTCHA
                className="space"
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={this.handleRecaptcha}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={!this.state.captchaResult}
              >
                Create Dataset
              </Button>

              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={this.state.open}
              >
                <label>
                  Please wait. You will be redirected to the Graph Generation
                  page automatically.
                </label>
                <CircularProgress color="inherit" />
              </Backdrop>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}

export default withCookies(Orders);
