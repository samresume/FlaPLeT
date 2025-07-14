import * as React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { Component } from "react";
import { withCookies } from "react-cookie";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import message from "./message.jpg";
import sessions from "./sessions.jpg";
import dataset from "./dataset.jpg";
import fndataset from "./fndataset.jpg";
import augmenteddataset from "./augmenteddataset.jpg";
import feedback from "./feedback.jpg";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CircularProgress, {
  circularProgressClasses,
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
function preventDefault(event) {
  event.preventDefault();
}

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
      token,
      access,
      completed_sessions: 0,
      completed_datasets: 0,
      completed_fn_datasets: 0,
      completed_augmented_datasets: 0,
      running_sessions: 0,
      running_datasets: 0,
      running_fn_datasets: 0,
      running_augmented_datasets: 0,
      failed_sessions: 0,
      failed_datasets: 0,
      failed_fn_datasets: 0,
      failed_augmented_datasets: 0,
      feedbacks: 0,
      bugreports: 0,
      messages: 0,
    };
  }

  click = () => {};

  componentDidMount() {
    if (this.state.token) {
      fetch("https://api.flaplet.org/solarflare/dataset/get_info", {
        method: "Get",
        headers: {
          Authorization: `Token ${this.state.token}`,
        },
      })
        .then((resp) => resp.json())
        .then((res) => {
          let completed = 0;
          let running = 0;
          let failed = 0;
          res.data.map((row) =>
            row.status == "completed"
              ? (completed = completed + 1)
              : row.status == "running"
              ? (running = running + 1)
              : (failed = failed + 1)
          );
          this.setState({ completed_datasets: completed });
          this.setState({ running_datasets: running });
          this.setState({ failed_datasets: failed });
          fetch("https://api.flaplet.org/solarflare/fn-dataset/get_info", {
            method: "Get",
            headers: {
              Authorization: `Token ${this.state.token}`,
            },
          })
            .then((resp) => resp.json())
            .then((res) => {
              let completed = 0;
              let running = 0;
              let failed = 0;
              res.data.map((row) =>
                row.status == "completed"
                  ? (completed = completed + 1)
                  : row.status == "running"
                  ? (running = running + 1)
                  : (failed = failed + 1)
              );
              this.setState({ completed_fn_datasets: completed });
              this.setState({ running_fn_datasets: running });
              this.setState({ failed_fn_datasets: failed });
              fetch(
                "https://api.flaplet.org/solarflare/augmented-dataset/get_info",
                {
                  method: "Get",
                  headers: {
                    Authorization: `Token ${this.state.token}`,
                  },
                }
              )
                .then((resp) => resp.json())
                .then((res) => {
                  let completed = 0;
                  let running = 0;
                  let failed = 0;
                  res.data.map((row) =>
                    row.status == "completed"
                      ? (completed = completed + 1)
                      : row.status == "running"
                      ? (running = running + 1)
                      : (failed = failed + 1)
                  );
                  this.setState({ completed_augmented_datasets: completed });
                  this.setState({ running_augmented_datasets: running });
                  this.setState({ failed_augmented_datasets: failed });
                  fetch(
                    "https://api.flaplet.org/solarflare/project/get_projects",
                    {
                      method: "Get",
                      headers: {
                        Authorization: `Token ${this.state.token}`,
                      },
                    }
                  )
                    .then((resp) => resp.json())
                    .then((res) => {
                      let completed = 0;
                      let running = 0;
                      let failed = 0;
                      res.data.map((row) =>
                        row.status == "completed"
                          ? (completed = completed + 1)
                          : row.status == "running"
                          ? (running = running + 1)
                          : (failed = failed + 1)
                      );
                      this.setState({ completed_sessions: completed });
                      this.setState({ running_sessions: running });
                      this.setState({ failed_sessions: failed });
                      fetch(
                        "https://api.flaplet.org/solarflare/feedback/get_info",
                        {
                          method: "Get",
                          headers: {
                            Authorization: `Token ${this.state.token}`,
                          },
                        }
                      )
                        .then((resp) => resp.json())
                        .then((res) => {
                          let count = 0;
                          res.data.map((row) => (count = count + 1));
                          this.setState({ feedbacks: count });
                          fetch(
                            "https://api.flaplet.org/solarflare/bug-report/get_info",
                            {
                              method: "Get",
                              headers: {
                                Authorization: `Token ${this.state.token}`,
                              },
                            }
                          )
                            .then((resp) => resp.json())
                            .then((res) => {
                              let count = 0;
                              res.data.map((row) => (count = count + 1));
                              this.setState({ bugreports: count });
                              fetch(
                                "https://api.flaplet.org/solarflare/message/get_info",
                                {
                                  method: "Get",
                                  headers: {
                                    Authorization: `Token ${this.state.token}`,
                                  },
                                }
                              )
                                .then((resp) => resp.json())
                                .then((res) => {
                                  let count = 0;
                                  res.data.map((row) => (count = count + 1));
                                  this.setState({ messages: count });
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
      window.location.href = `${process.env.PUBLIC_URL}/login`;
    }
  }

  render() {
    if (this.state.access !== "1" || !this.state.token) {
      return null; // or a spinner/message if you want
    }
    return (
      <React.Fragment>
        <h2 className={"h2"}>Dashboard</h2>

        <Grid container sx={{ p: 2 }} spacing={2}>
          <Grid item xs={4}>
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="100"
                  image={sessions}
                  alt="ML Sessions"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    ML Sessions
                  </Typography>
                  <Stack className="space" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Completed : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "limegreen" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.completed_sessions}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Running : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "dodgerblue" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.running_sessions}
                    />
                    <CircularProgress
                      variant="indeterminate"
                      disableShrink
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "light"
                            ? "dodgerblue"
                            : "dodgerblue",
                        animationDuration: "1000ms",
                        [`& .${circularProgressClasses.circle}`]: {
                          strokeLinecap: "round",
                        },
                      }}
                      size={15}
                      thickness={3}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Failed : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "tomato" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.failed_sessions}
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
              <Divider sx={{ mt: 1, mb: 1 }} variant="middle" />
              <CardActions>
                <Button
                  size="small"
                  color="secondary"
                  onClick={(event) => {
                    window.location.href = `${process.env.PUBLIC_URL}/ml-sessions`;
                  }}
                >
                  Go to ML Sessions
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="100"
                  image={dataset}
                  alt="Datasets"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Datasets
                  </Typography>
                  <Stack className="space" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Completed : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "limegreen" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.completed_datasets}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Running : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "dodgerblue" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.running_datasets}
                    />
                    <CircularProgress
                      variant="indeterminate"
                      disableShrink
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "light"
                            ? "dodgerblue"
                            : "dodgerblue",
                        animationDuration: "1000ms",
                        [`& .${circularProgressClasses.circle}`]: {
                          strokeLinecap: "round",
                        },
                      }}
                      size={15}
                      thickness={3}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Failed : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "tomato" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.failed_datasets}
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
              <Divider sx={{ mt: 1, mb: 1 }} variant="middle" />
              <CardActions>
                <Button
                  size="small"
                  color="secondary"
                  onClick={(event) => {
                    window.location.href = `${process.env.PUBLIC_URL}/datasets`;
                  }}
                >
                  Go to Datasets
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="100"
                  image={fndataset}
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Graph Generation
                  </Typography>
                  <Stack className="space" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Completed : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "limegreen" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.completed_fn_datasets}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Running : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "dodgerblue" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.running_fn_datasets}
                    />
                    <CircularProgress
                      variant="indeterminate"
                      disableShrink
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "light"
                            ? "dodgerblue"
                            : "dodgerblue",
                        animationDuration: "1000ms",
                        [`& .${circularProgressClasses.circle}`]: {
                          strokeLinecap: "round",
                        },
                      }}
                      size={15}
                      thickness={3}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Failed : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "tomato" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.failed_fn_datasets}
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
              <Divider sx={{ mt: 1, mb: 1 }} variant="middle" />
              <CardActions>
                <Button
                  size="small"
                  color="secondary"
                  onClick={(event) => {
                    window.location.href = `${process.env.PUBLIC_URL}/graph-generation`;
                  }}
                >
                  Go to Graph Generation
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="100"
                  image={augmenteddataset}
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Data Augmentation
                  </Typography>
                  <Stack className="space" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Completed : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "limegreen" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.completed_augmented_datasets}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Running : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "dodgerblue" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.running_augmented_datasets}
                    />
                    <CircularProgress
                      variant="indeterminate"
                      disableShrink
                      sx={{
                        color: (theme) =>
                          theme.palette.mode === "light"
                            ? "dodgerblue"
                            : "dodgerblue",
                        animationDuration: "1000ms",
                        [`& .${circularProgressClasses.circle}`]: {
                          strokeLinecap: "round",
                        },
                      }}
                      size={15}
                      thickness={3}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Failed : "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "tomato" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.failed_augmented_datasets}
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
              <Divider sx={{ mt: 1, mb: 1 }} variant="middle" />
              <CardActions>
                <Button
                  size="small"
                  color="secondary"
                  onClick={(event) => {
                    window.location.href = `${process.env.PUBLIC_URL}/data-augmentation`;
                  }}
                >
                  Go to Data Augmentation
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="100"
                  image={feedback}
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Bug Report & Feedback
                  </Typography>
                  <Stack className="space" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Bug Report: "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.bugreports}
                    />
                  </Stack>
                  <Stack className="dashcardspace" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Feedback "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.feedbacks}
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
              <Divider sx={{ mt: 1, mb: 1 }} variant="middle" />
              <CardActions>
                <Button
                  size="small"
                  color="secondary"
                  onClick={(event) => {
                    window.location.href = `${process.env.PUBLIC_URL}/bug-report`;
                  }}
                >
                  Go to Bug Report
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  onClick={(event) => {
                    window.location.href = `${process.env.PUBLIC_URL}/feedback`;
                  }}
                >
                  Go to Feedback
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="100"
                  image={message}
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Messages
                  </Typography>
                  <Stack className="space" direction="row" spacing={1}>
                    <Chip
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={"Messages "}
                    />
                    <Chip
                      className="dashchipsize"
                      sx={{ color: "black" }}
                      size={"small"}
                      onClick={this.click}
                      label={this.state.messages}
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
              <Divider sx={{ mt: 1, mb: 1 }} variant="middle" />
              <CardActions>
                <Button
                  size="small"
                  color="secondary"
                  onClick={(event) => {
                    window.location.href = `${process.env.PUBLIC_URL}/messages`;
                  }}
                >
                  Go to Messages
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
export default withCookies(Orders);
