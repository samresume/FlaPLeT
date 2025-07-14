import React, { Component } from "react";
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
import { withCookies } from "react-cookie";
import ReCAPTCHA from "react-google-recaptcha";
import logo from "../logo.png";
import { grey, orange, red } from "@mui/material/colors";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

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

class LoginUi extends Component {
  state = {
    credentials: {
      username: "",
      password: "",
    },
    wrong: false,
    captchaResult: "",
    cookieduration: false,
    token: this.props.cookies.get("user-token"),
    access: this.props.cookies.get("access"),
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

  handleSubmit = (event) => {
    event.preventDefault();
    fetch("https://api.flaplet.org/auth/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.state.credentials),
    })
      .then((resp) => resp.json())
      .then((res) => {
        if (res.token) {
          const cookieOptions = {
            maxAge: this.state.cookieduration ? 604800 : 21600,
          };

          this.props.cookies.set("user-token", res.token, cookieOptions);
          this.setState({ token: res.token });

          fetch("https://api.flaplet.org/solarflare/user-info/get_info", {
            method: "GET",
            headers: {
              Authorization: `Token ${res.token}`,
            },
          })
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
  };

  inputChanged = (event) => {
    if (event.target.name == "duration") {
      let value = event.target.checked;
      this.setState({ cookieduration: value });
    } else {
      let cred = this.state.credentials;
      cred[event.target.name] = event.target.value;
      this.setState({ credentials: cred });
    }
  };

  onGoogleLoginSuccess = (event) => {};

  onGoogleLoginFailure = (event) => {};

  componentDidMount() {
    const token = this.props.cookies.get("user-token");
    const access = this.props.cookies.get("access");

    if (token) {
      if (access && access.toString() === "1") {
        window.location.href = `${process.env.PUBLIC_URL}/dashboard`;
      }
    }
  }

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
              Log In
            </Typography>

            <Box
              component="form"
              onSubmit={this.handleSubmit}
              noValidate
              sx={{ mt: 5 }}
            >
              <Grid container spacing={2} sx={{ maxWidth: "350px" }}>
                <Grid item xs={12}>
                  <TextField
                    theme={theme}
                    value={this.state.credentials.username}
                    onChange={this.inputChanged}
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="username"
                    autoComplete="email"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    theme={theme}
                    value={this.state.credentials.password}
                    onChange={this.inputChanged}
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    theme={theme}
                    control={
                      <Checkbox
                        checked={this.state.cookieduration}
                        onChange={this.inputChanged}
                        color="primary"
                      />
                    }
                    label="Remember me"
                    name="duration"
                  />
                </Grid>

                <Grid item xs={12}>
                  <div className="cta">
                    <ReCAPTCHA
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      onChange={this.handleRecaptcha}
                    />
                    {this.state.captchaResult ? (
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Log In
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled
                      >
                        Log In
                      </Button>
                    )}
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <Grid container>
                    <Grid className={"incorrect"} item sx={{ mt: 3, mb: 2 }}>
                      <p href="#" variant="body2">
                        {this.state.wrong === true
                          ? "The username or password is incorrect!"
                          : ""}
                      </p>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs>
                      <Link href="#" variant="body2">
                        Forgot password?
                      </Link>
                    </Grid>
                    <Grid item className="bottom">
                      <Link to="/signup" variant="body2">
                        {"Don't have an account? Sign Up"}
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
export default withCookies(LoginUi);
