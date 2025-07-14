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
  FormControl,
  Select,
  Backdrop,
  CircularProgress,
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
      token,
      access,
      captchaResult: "",
      backendError: "",
      profile: {
        name: "",
        type: "",
        country: "",
        phone: "",
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

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ open: true, backendError: "" });

    const { name, type, country, phone } = this.state.profile;

    if (!name || !type || !country) {
      this.setState({
        open: false,
        backendError: "Please fill out Name, Type, and Country.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("country", country);
    formData.append("phone", phone ?? "");

    fetch("https://api.flaplet.org/solarflare/user-info/set_info/", {
      method: "POST",
      headers: {
        Authorization: `Token ${this.state.token}`,
      },
      body: formData,
    })
      .then((resp) => resp.json())
      .then((res) => {
        if (res.message === "success") {
          this.setState({ open: false });
          window.location.href = `${process.env.PUBLIC_URL}/profile`;
        } else {
          this.setState({
            open: false,
            backendError: "Submission failed. Please try again.",
          });
        }
      })
      .catch(() => {
        this.setState({
          open: false,
          backendError: "Server error. Please try again later.",
        });
      });
  };

  inputChanged = (event) => {
    const updated = { ...this.state.profile };
    updated[event.target.name.toLowerCase()] = event.target.value;
    this.setState({ profile: updated, backendError: "" });
  };

  render() {
    if (this.state.access !== "1" || !this.state.token) return null;

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <h2 className="h2">Edit Profile</h2>
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
                    required
                    value={this.state.profile.name}
                    onChange={this.inputChanged}
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="Name"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    value={this.state.profile.phone}
                    onChange={this.inputChanged}
                    fullWidth
                    id="phone"
                    label="Phone Number (Optional)"
                    name="Phone"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl required fullWidth>
                    <InputLabel>Select Your Usage</InputLabel>
                    <Select
                      value={this.state.profile.type}
                      label="Select Your Usage"
                      name="Type"
                      onChange={this.inputChanged}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="personal">Personal</MenuItem>
                      <MenuItem value="organization">Organization</MenuItem>
                      <MenuItem value="school">School</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl required fullWidth>
                    <InputLabel>Select Your Country</InputLabel>
                    <Select
                      value={this.state.profile.country}
                      label="Select Your Country"
                      name="Country"
                      onChange={this.inputChanged}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value="unitedstates">United States</MenuItem>
                      <MenuItem value="canada">Canada</MenuItem>
                    </Select>
                  </FormControl>
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
                <label>
                  Please wait. You will be redirected to the Profile page.
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
