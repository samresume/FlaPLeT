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
  FormHelperText,
  FormControl,
  Backdrop,
  CircularProgress,
  circularProgressClasses,
  Snackbar,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Component } from "react";
import { withCookies } from "react-cookie";
import ReCAPTCHA from "react-google-recaptcha";
import { grey, orange } from "@mui/material/colors";
import { Rating } from "@mui/lab";

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
      feedback: {
        title: "",
        description: "",
        score: null,
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

    const { title, score } = this.state.feedback;
    if (!title || score === null) {
      this.setState({
        open: false,
        backendError: "Please complete all required fields before submitting.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", this.state.feedback.title);
    formData.append("description", this.state.feedback.description);
    formData.append("score", this.state.feedback.score);

    fetch("https://api.flaplet.org/solarflare/feedback/set_info/", {
      method: "POST",
      headers: {
        Authorization: `Token ${this.state.token}`,
      },
      body: formData,
    })
      .then((resp) => resp.json())
      .then(() => {
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

  handleChange = (event, value) => {
    const { name } = event.target;
    const updated = { ...this.state.feedback };

    if (name === "Title") updated.title = event.target.value;
    else if (name === "Description") updated.description = event.target.value;
    else if (event.target.name === "Score") updated.score = value;

    this.setState({ feedback: updated, backendError: "" });
  };

  render() {
    if (this.state.access !== "1" || !this.state.token) return null;

    return (
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <h2 className="h2">Feedback</h2>
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
                    value={this.state.feedback.title}
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
                    value={this.state.feedback.description}
                    onChange={this.handleChange}
                    margin="normal"
                    fullWidth
                    id="Description"
                    name="Description"
                    label="Description"
                    multiline
                    rows={5}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography className="space" component="legend">
                    Score
                  </Typography>
                  <Rating
                    name="Score"
                    value={this.state.feedback.score}
                    onChange={this.handleChange}
                  />
                  <FormHelperText sx={{ mt: 1 }}>
                    Select a score from 1 to 5
                  </FormHelperText>
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
                <h3>Please wait.</h3>
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
