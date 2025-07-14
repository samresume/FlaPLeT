import * as React from "react";
import {
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
  FormGroup,
  FormControlLabel,
  Switch,
  Input,
  Backdrop,
  Snackbar,
  Alert,
  CircularProgress,
  circularProgressClasses,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Component } from "react";
import { withCookies } from "react-cookie";
import ReCAPTCHA from "react-google-recaptcha";
import { grey, orange } from "@mui/material/colors";

const font = "'Assistant', sans-serif";

const theme = createTheme({
  typography: {
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
      backendError: "",
      snackbar: false,
      bug: {
        title: "",
        description: "",
        type: "",
        file: null,
        urgent: false,
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

  handleFile0Change = (e) => {
    let thenew = this.state.bug;
    const file = e.target.files[0];

    if (file) {
      const isJPG =
        file.type === "image/jpeg" ||
        file.name.toLowerCase().endsWith(".jpg") ||
        file.name.toLowerCase().endsWith(".jpeg");
      const isUnder1MB = file.size <= 1 * 1024 * 1024;

      if (!isJPG) {
        this.setState({
          backendError: "Only JPG images are allowed.",
        });
        return;
      }

      if (!isUnder1MB) {
        this.setState({
          backendError: "File size must be under 1MB.",
        });
        return;
      }

      thenew["file"] = file;
      this.setState({ bug: thenew, backendError: "" });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ open: true, backendError: "" });

    const { title, description, type, file } = this.state.bug;

    if (!title || !description || !type || !file) {
      this.setState({
        open: false,
        backendError: "Please complete all required fields before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("file0", file);
    formData.append("urgent", this.state.bug.urgent);

    fetch("https://api.flaplet.org/solarflare/bug-report/set_info/", {
      method: "POST",
      headers: {
        Authorization: `Token ${this.state.token}`,
      },
      body: formData,
    })
      .then((resp) => resp.json())
      .then((res) => {
        this.setState({ open: false });
        window.location.href = `${process.env.PUBLIC_URL}/dashboard`;
      })
      .catch(() => {
        this.setState({
          open: false,
          backendError: "Submission failed. Please try again.",
        });
      });
  };

  handleChange = (event) => {
    let thenew = this.state.bug;

    if (event.target.name === "Type") {
      thenew["type"] = event.target.value;
    } else if (event.target.name === "Title") {
      thenew["title"] = event.target.value;
    } else if (event.target.name === "Description") {
      thenew["description"] = event.target.value;
    } else if (event.target.name === "Urgent") {
      thenew["urgent"] = event.target.checked;
    }

    this.setState({ bug: thenew, backendError: "" });
  };

  render() {
    if (this.state.access !== "1" || !this.state.token) return null;

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <h2 className="h2">Bug Report</h2>
          <CssBaseline />
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
              <Grid container spacing={2} sx={{ maxWidth: "350px" }}>
                <Grid item xs={12}>
                  <TextField
                    className="space"
                    value={this.state.bug.title}
                    onChange={this.handleChange}
                    margin="normal"
                    required
                    fullWidth
                    id="Title"
                    label="Title"
                    name="Title"
                    autoFocus
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    className="space"
                    value={this.state.bug.description}
                    onChange={this.handleChange}
                    margin="normal"
                    required
                    fullWidth
                    id="description"
                    name="Description"
                    label="Description"
                    multiline
                    rows={5}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl required className="space" fullWidth>
                    <InputLabel>Type of Bug</InputLabel>
                    <Select
                      value={this.state.bug.type}
                      label="Type of Bug"
                      name="Type"
                      onChange={this.handleChange}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={"ui"}>User Interface</MenuItem>
                      <MenuItem value={"server"}>Server</MenuItem>
                      <MenuItem value={"security"}>Security</MenuItem>
                      <MenuItem value={"programing"}>Programming</MenuItem>
                    </Select>
                    <FormHelperText>Select type of the bug</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Input
                    className="space-file"
                    fullWidth
                    type="file"
                    accept=".jpg,.jpeg,image/jpeg"
                    onChange={this.handleFile0Change}
                  />
                  <FormHelperText>
                    Upload a JPG image (max size: 1MB)
                  </FormHelperText>
                </Grid>

                <Grid item xs={12}>
                  <FormGroup>
                    <FormControlLabel
                      className="space-file"
                      label="Urgency"
                      name="Urgent"
                      onChange={this.handleChange}
                      control={<Switch checked={this.state.bug.urgent} />}
                    />
                  </FormGroup>
                  <FormHelperText>Is this urgent?</FormHelperText>
                </Grid>

                {this.state.backendError && (
                  <Grid item xs={12}>
                    <Typography color="error">
                      {this.state.backendError}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <ReCAPTCHA
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                    onChange={this.handleRecaptcha}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={!this.state.captchaResult}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>

              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={this.state.open}
              >
                <h3>Please Wait.</h3>
                <CircularProgress
                  variant="indeterminate"
                  disableShrink
                  sx={{
                    ml: 2,
                    color: "#000000",
                    animationDuration: "550ms",
                    [`& .${circularProgressClasses.circle}`]: {
                      strokeLinecap: "round",
                    },
                  }}
                  size={40}
                  thickness={4}
                />
              </Backdrop>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}

export default withCookies(Orders);
