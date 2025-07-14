import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Component } from "react";
import { withCookies } from "react-cookie";
import ReCAPTCHA from "react-google-recaptcha";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import StrengthMeter from "./StrengthMeter";
import logo from "../logo.png";
import { grey, orange, red } from "@mui/material/colors";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import FormControl from "@mui/material/FormControl";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
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
class SignupUi extends Component {
  handleSubmit = (event) => {
    console.log(this.state.passRepeat);
    console.log(this.state.credentials.password);
    event.preventDefault();

    if (this.state.passRepeat === this.state.credentials.password) {
      const cred = this.state.credentials;

      if (
        !cred.name ||
        !cred.username ||
        !cred.type ||
        !cred.country ||
        !cred.password
      ) {
        this.setState({ passWrong: false, isRequired: true });
        return;
      }

      fetch("https://api.flaplet.org/solarflare/user/set_user/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      })
        .then((resp) => resp.json())
        .then((res) => {
          if (res.message === "success") {
            this.setState({ wrong: false });

            fetch("https://api.flaplet.org/auth/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(cred),
            })
              .then((resp) => resp.json())
              .then((res) => {
                if (res.token) {
                  const cookieOptions = {
                    maxAge: 21600,
                  };
                  this.props.cookies.set(
                    "user-token",
                    res.token,
                    cookieOptions
                  );
                  this.setState({ token: res.token });

                  fetch(
                    "https://api.flaplet.org/solarflare/user-info/get_info",
                    {
                      method: "GET",
                      headers: {
                        Authorization: `Token ${res.token}`,
                      },
                    }
                  )
                    .then((resp) => resp.json())
                    .then((res2) => {
                      const access = res2.data.access?.toString() || "0";
                      this.props.cookies.set("access", access, cookieOptions);
                      this.setState({ access });

                      if (access === "1") {
                        window.location.href = `${process.env.PUBLIC_URL}/dashboard`;
                      } else {
                        window.location.href = `${process.env.PUBLIC_URL}/access`;
                      }
                    });
                } else {
                  this.setState({ wrong: true });
                }
              })
              .catch(() => this.setState({ wrong: true }));
          } else {
            this.setState({ wrong: true });
          }
        })
        .catch(() => this.setState({ wrong: true }));
    } else {
      this.setState({ passWrong: true });
    }
  };

  inputChanged = (event) => {
    let caps, small, num, specialSymbol;
    let cred = this.state.credentials;
    cred[event.target.name] = event.target.value;

    if (event.target.name == "passRepeat") {
      this.setState({ passRepeat: event.target.value });
    }
    if (event.target.name == "password") {
      this.setState({ credentials: cred });
      this.setState({ preventReRun: false });

      if (event.target.value.length < 14) {
        this.setState({
          isError:
            "Password should contain minimum 14 characters, with one UPPERCASE, lowercase, number and special character: @$! % * ? &",
        });
      } else {
        caps = (event.target.value.match(/[A-Z]/g) || []).length;
        small = (event.target.value.match(/[a-z]/g) || []).length;
        num = (event.target.value.match(/[0-9]/g) || []).length;
        specialSymbol = (event.target.value.match(/\W/g) || []).length;
        if (caps < 1) {
          this.setState({ isError: "Must add one UPPERCASE letter" });
        } else if (small < 1) {
          this.setState({ isError: "Must add one lowercase letter" });
        } else if (num < 1) {
          this.setState({ isError: "Must add one number" });
        } else if (specialSymbol < 1) {
          this.setState({
            isError: "Must add one special symbol: @$! % * ? &",
          });
        } else {
          this.setState({ isError: null });
        }
      }
    } else {
      this.setState({ credentials: cred });
    }
  };

  initPwdInput = (value) => {
    if (this.state.preventReRun == false) {
      this.setState({ isStrong: value });
      this.setState({ preventReRun: true });
    }
  };

  state = {
    credentials: {
      name: "",
      type: "",
      country: "",
      username: "",
      password: "",
    },
    wrong: false,
    captchaResult: null,
    passRepeat: "",
    passWrong: false,
    isRequired: false,
    isError: null,
    isStrong: null,
    preventReRun: true,
  };

  handleRecaptcha = (value) => {
    fetch("https://api.flaplet.org/recaptcha/", {
      method: "POST",
      body: JSON.stringify({ captcha_value: value }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.captcha.success);
        this.setState({ captchaResult: data.captcha.success });
      });
  };

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Link to="/">
              <img className="logo-login" src={logo}></img>
            </Link>
            <Typography component="h1" variant="h4">
              Sign Up
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={this.handleSubmit}
              sx={{ mt: 5 }}
            >
              <Grid container spacing={2} sx={{ maxWidth: "350px" }}>
                <Grid item xs={12}>
                  <TextField
                    required
                    theme={theme}
                    value={this.state.credentials.name}
                    onChange={this.inputChanged}
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    theme={theme}
                    required
                    value={this.state.credentials.username}
                    onChange={this.inputChanged}
                    fullWidth
                    id="username"
                    label="Email"
                    name="username"
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    className="section"
                    variant="h6"
                    component="h6"
                  ></Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl required sx={{ width: "100%" }}>
                    <InputLabel className="font">Select Your Usage</InputLabel>
                    <Select
                      fullWidth
                      value={this.state.credentials.type}
                      label="Select Your Usage"
                      name="type"
                      onChange={this.inputChanged}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem className="font" value={"personal"}>
                        Personal
                      </MenuItem>
                      <MenuItem className="font" value={"organization"}>
                        Organization
                      </MenuItem>
                      <MenuItem className="font" value={"school"}>
                        School
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl required sx={{ width: "100%" }}>
                    <InputLabel className="font">
                      Select Your Country
                    </InputLabel>
                    <Select
                      fullWidth
                      value={this.state.credentials.country}
                      label="Select Your Country"
                      name="country"
                      onChange={this.inputChanged}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem className="font" value={"unitedstates"}>
                        United States
                      </MenuItem>
                      <MenuItem className="font" value={"canada"}>
                        Canada
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    className="section"
                    variant="h6"
                    component="h6"
                  ></Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    theme={theme}
                    required
                    value={this.state.credentials.password}
                    onChange={this.inputChanged}
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                  />
                </Grid>
                {this.state.isError !== null && (
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid className={"incorrect"} item sx={{ mt: 3, mb: 2 }}>
                        <p variant="body2">{this.state.isError}</p>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <StrengthMeter
                    password={this.state.credentials.password}
                    actions={this.initPwdInput}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    theme={theme}
                    required
                    value={this.state.passRepeat}
                    onChange={this.inputChanged}
                    fullWidth
                    name="passRepeat"
                    label="Re-Enter Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Grid container>
                    <Grid className={"incorrect"} item sx={{ mt: 3, mb: 2 }}>
                      <p href="#" variant="body2">
                        {this.state.passWrong === true
                          ? "The password is not the same!"
                          : ""}
                      </p>
                      <p href="#" variant="body2">
                        {this.state.isRequired === true
                          ? "Please fill out all the necessary inputs!"
                          : ""}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <div className="cta">
                    <ReCAPTCHA
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      onChange={this.handleRecaptcha}
                    />
                    {this.state.captchaResult !== null ? (
                      this.state.isStrong === "strong" ? (
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          sx={{ mt: 3, mb: 2 }}
                        >
                          Sign Up
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          sx={{ mt: 3, mb: 2 }}
                          disabled
                        >
                          Sign Up
                        </Button>
                      )
                    ) : (
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled
                      >
                        Sign Up
                      </Button>
                    )}
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <Grid container>
                    <Grid className={"incorrect"} item sx={{ mt: 3, mb: 2 }}>
                      <p href="#" variant="body2">
                        {this.state.wrong === true
                          ? "Something went wrong!"
                          : ""}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container justifyContent="flex-end">
                    <Grid item className="bottom">
                      <Link to="/login" variant="body2">
                        Already have an account? Log in
                      </Link>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}
export default withCookies(SignupUi);
