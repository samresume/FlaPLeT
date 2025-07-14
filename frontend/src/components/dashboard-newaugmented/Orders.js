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

// top imports remain the same

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
      submitted: false,
      fieldErrors: {
        dataset_name: false,
        dataset_id: false,
        data_augmentation: false,
      },
      backendError: "",
      experiment: {
        dataset_name: "",
        description: "",
        dataset_id: null,
        data_augmentation: "",
        k_neighbors: 5,
        batch_size: 64,
        iteration: 2000,
        num_layers: 2,
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
    const updated = { ...this.state.experiment };
    updated[name] = value;
    this.setState({ experiment: updated });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const { dataset_name, dataset_id, data_augmentation } =
      this.state.experiment;

    const fieldErrors = {
      dataset_name: !dataset_name,
      dataset_id: !dataset_id,
      data_augmentation: !data_augmentation,
    };

    const hasErrors = Object.values(fieldErrors).some(Boolean);
    this.setState({ fieldErrors, submitted: true, backendError: "" });

    if (hasErrors) {
      this.setState({ open: false });
      return;
    }

    // Build payload dynamically based on augmentation method
    const { description, k_neighbors, batch_size, iteration, num_layers } =
      this.state.experiment;

    const payload = {
      dataset_name,
      dataset_id,
      data_augmentation,
      description,
    };

    if (data_augmentation === "smote") {
      payload.k_neighbors = k_neighbors;
    } else if (data_augmentation === "timegan") {
      payload.batch_size = batch_size;
      payload.iteration = iteration;
      payload.num_layers = num_layers;
    }

    this.setState({ open: true });

    fetch("https://api.flaplet.org/solarflare/augmented-dataset/set_info/", {
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
          window.location.href = `${process.env.PUBLIC_URL}/data-augmentation`;
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
    const { experiment, datasets, fieldErrors, submitted, backendError } =
      this.state;

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <h2 className="h2">New Data Augmentation</h2>
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
                id="Name"
                label="Dataset Name"
                name="dataset_name"
              />

              <TextField
                className="space"
                value={experiment.description}
                onChange={this.handleChange}
                margin="normal"
                fullWidth
                id="Description"
                name="description"
                label="Description"
                multiline
                rows={4}
              />

              <FormControl required className="space" fullWidth>
                <InputLabel>Dataset</InputLabel>
                <Select
                  value={experiment.dataset_id || ""}
                  label="Dataset"
                  name="dataset_id"
                  onChange={this.handleChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {datasets.map((row) =>
                    row.status === "completed" ? (
                      <MenuItem key={row.id} value={row.id}>
                        {row.dataset_name}
                      </MenuItem>
                    ) : (
                      <MenuItem disabled key={row.id} value={row.id}>
                        {row.dataset_name}
                      </MenuItem>
                    )
                  )}
                </Select>
                <FormHelperText>Select one of your Datasets</FormHelperText>
              </FormControl>

              <FormControl required className="space" fullWidth>
                <InputLabel>Data Augmentation</InputLabel>
                <Select
                  value={experiment.data_augmentation}
                  label="Data Augmentation"
                  name="data_augmentation"
                  onChange={this.handleChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="smote">SMOTE</MenuItem>
                  <MenuItem disabled value="timegan">
                    TimeGAN
                  </MenuItem>
                </Select>
                <FormHelperText>Select the augmentation method</FormHelperText>
              </FormControl>

              {/* SMOTE Hyperparameter */}
              {experiment.data_augmentation === "smote" && (
                <>
                  <Typography
                    className="section"
                    variant="body1"
                    sx={{ mt: 2 }}
                  >
                    Number of Neighbors (k)
                  </Typography>
                  <Slider
                    name="k_neighbors"
                    value={experiment.k_neighbors}
                    onChange={(e, val) =>
                      this.setState({
                        experiment: {
                          ...this.state.experiment,
                          k_neighbors: val,
                        },
                      })
                    }
                    valueLabelDisplay="auto"
                    min={2}
                    max={20}
                    step={1}
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              {/* TimeGAN Hyperparameters */}
              {experiment.data_augmentation === "timegan" && (
                <>
                  <FormControl required className="space" fullWidth>
                    <InputLabel>Batch Size</InputLabel>
                    <Select
                      name="batch_size"
                      value={experiment.batch_size}
                      onChange={this.handleChange}
                    >
                      {[32, 64, 128].map((val) => (
                        <MenuItem key={val} value={val}>
                          {val}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl required className="space" fullWidth>
                    <InputLabel>Iteration</InputLabel>
                    <Select
                      name="iteration"
                      value={experiment.iteration}
                      onChange={this.handleChange}
                    >
                      {[1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000].map(
                        (val) => (
                          <MenuItem key={val} value={val}>
                            {val}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>

                  <Typography
                    className="section"
                    variant="body1"
                    sx={{ mt: 2 }}
                  >
                    Number of Layers
                  </Typography>
                  <Slider
                    name="num_layers"
                    value={experiment.num_layers}
                    onChange={(e, val) =>
                      this.setState({
                        experiment: {
                          ...this.state.experiment,
                          num_layers: val,
                        },
                      })
                    }
                    valueLabelDisplay="auto"
                    min={1}
                    max={6}
                    step={1}
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              {/* Error display */}
              {this.state.submitted &&
                Object.values(this.state.fieldErrors).some(Boolean) && (
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
                  Please wait. You will be redirected to the Data Augmentation
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
