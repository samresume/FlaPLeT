import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Grid,
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
  Link,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Component } from "react";
import { withCookies } from "react-cookie";
import ReCAPTCHA from "react-google-recaptcha";

import { grey, orange } from "@mui/material/colors";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="">
        Solar Flare Prediction
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const font = "'Assistant', sans-serif";

const theme = createTheme({
  typography: {
    // In Chinese and Japanese the characters are usually larger,
    // so a smaller fontsize may be appropriate.
    fontSize: 12,
    fontFamily: font,
  },
  palette: {
    primary: {
      main: grey[900],
    },
    secondary: {
      main: orange[400],
    },
  },
});

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
      token: token,
      access: access,
      captchaResult: "",
      isRequired: false,
      backendError: "",
      experiment: {
        dataset_name: "",
        description: "",
        file0: null,
        file1: null,
        missing_value: "",
        normalization: "none",
      },
    };
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

  handleFileChange = (field, file) => {
    const updated = this.state.experiment;
    const isPkl = file.name.endsWith(".pkl");
    const isValidSize = file.size <= 20 * 1024 * 1024;

    if (!isPkl || !isValidSize) {
      this.setState({
        backendError: `${
          field === "file0" ? "Train" : "Label"
        } file must be a .pkl under 20MB.`,
      });
      return;
    }

    updated[field] = file;
    this.setState({ experiment: updated, backendError: "" });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ open: true, backendError: "" });

    const exp = this.state.experiment;
    if (
      !exp.dataset_name ||
      !exp.file0 ||
      !exp.file1 ||
      !exp.missing_value ||
      exp.normalization === ""
    ) {
      this.setState({
        open: false,
        isRequired: true,
        backendError: "All fields are required and must be valid.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("dataset_name", exp.dataset_name);
    formData.append("description", exp.description);
    formData.append("missing_value", exp.missing_value);
    formData.append("normalization", exp.normalization);
    formData.append("file0", exp.file0);
    formData.append("file1", exp.file1);

    fetch("https://api.flaplet.org/solarflare/dataset/set_info/", {
      method: "POST",
      headers: { Authorization: `Token ${this.state.token}` },
      body: formData,
    })
      .then((resp) => resp.json())
      .then((res) => {
        if (res.message === "success") {
          window.location.href = `${process.env.PUBLIC_URL}/datasets`;
        } else {
          this.setState({
            open: false,
            backendError: "Something went wrong!",
          });
        }
      })
      .catch(() => {
        this.setState({
          open: false,
          backendError: "Server error. Please try again.",
        });
      });
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    const updated = this.state.experiment;
    updated[name] = value;
    this.setState({ experiment: updated, backendError: "" });
  };

  render() {
    if (this.state.access !== "1" || !this.state.token) return null;

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <h2 className={"h2"}>New Dataset</h2>
          <CssBaseline />
          <Box
            sx={{
              mt: 5,
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
                value={this.state.experiment.dataset_name}
                onChange={this.handleChange}
                margin="normal"
                required
                fullWidth
                label="Dataset Name"
                name="dataset_name"
              />
              <TextField
                className="space"
                value={this.state.experiment.description}
                onChange={this.handleChange}
                margin="normal"
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={4}
              />

              <FormControl required className="space" fullWidth>
                <InputLabel>Missing Values</InputLabel>
                <Select
                  value={this.state.experiment.missing_value}
                  label="Missing Value"
                  name="missing_value"
                  onChange={this.handleChange}
                >
                  <MenuItem value="remove">Remove Missing Values</MenuItem>
                  <MenuItem value="mean">Mean Imputation</MenuItem>
                </Select>
                <FormHelperText>
                  Select how to handle missing values
                </FormHelperText>
              </FormControl>

              <FormControl required className="space" fullWidth>
                <InputLabel>Normalization</InputLabel>
                <Select
                  value={this.state.experiment.normalization}
                  label="Normalization"
                  name="normalization"
                  onChange={this.handleChange}
                >
                  <MenuItem value="none">Nothing</MenuItem>
                  <MenuItem value="zscore">Z-score Normalization</MenuItem>
                  <MenuItem value="minmax">Min-Max Scaling</MenuItem>
                </Select>
                <FormHelperText>Choose normalization method</FormHelperText>
              </FormControl>

              <FormControl required fullWidth>
                <input
                  name="file0"
                  className="space-file"
                  type="file"
                  accept=".pkl"
                  onChange={(e) =>
                    this.handleFileChange("file0", e.target.files[0])
                  }
                />
                <FormHelperText>Upload Train Data (.pkl)</FormHelperText>
              </FormControl>

              <FormControl required fullWidth>
                <input
                  name="file1"
                  className="space-file"
                  type="file"
                  accept=".pkl"
                  onChange={(e) =>
                    this.handleFileChange("file1", e.target.files[0])
                  }
                />
                <FormHelperText>Upload Labels (.pkl)</FormHelperText>
              </FormControl>

              {this.state.backendError && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {this.state.backendError}
                </Typography>
              )}

              <ReCAPTCHA
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
                Upload Dataset
              </Button>

              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={this.state.open}
              >
                <label>
                  Please wait. You will be redirected to the Datasets page.
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
