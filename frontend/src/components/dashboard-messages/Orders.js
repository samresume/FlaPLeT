import React, { Component } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import AlarmIcon from "@mui/icons-material/Alarm";
import EventIcon from "@mui/icons-material/Event";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { Class } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { withCookies } from "react-cookie";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import StraightenIcon from "@mui/icons-material/Straighten";
import DownloadIcon from "@mui/icons-material/Download";
import LoadingButton from "@mui/lab/LoadingButton";

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
      experiments: [],
      open: false,
      snackbar: false,
      token: token,
      access: access,
      delete: {
        dataset_id: -1,
      },
      dataLoading: true,
    };
  }

  handleClickOpen = (id, e) => {
    this.setState({ open: true });

    let myid = this.state.delete;
    myid["dataset_id"] = id;
    this.setState({ delete: myid });
  };

  downloadDataset = (id, e) => {};

  snackClose = () => {
    this.setState({ snackbar: false });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleClick = () => {
    console.info("You clicked the Chip.");
  };

  componentDidMount() {
    if (this.state.token) {
      fetch("https://api.flaplet.org/solarflare/message/get_info", {
        method: "Get",
        headers: {
          Authorization: `Token ${this.state.token}`,
        },
      })
        .then((resp) => resp.json())
        .then((res) => this.setState({ experiments: res.data }))
        .catch();
    } else {
      window.location.href = "login";
    }
  }

  render() {
    if (this.state.access !== "1" || !this.state.token) {
      return null; // or a spinner/message if you want
    }
    return (
      <React.Fragment>
        <h2 className={"h2"}>Messages</h2>

        {this.state.experiments.map((row) => (
          <Grid key={row.id} item xs={12}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Stack className="space" direction="row" spacing={1}>
                <Typography className={"title"} variant="h6" component="h5">
                  {row.title}
                </Typography>
              </Stack>
              <Stack className="space" direction="row" spacing={1}>
                <Typography className={"description"} variant="p" component="p">
                  {row.description}
                </Typography>
              </Stack>
              <Stack className="space" direction="row" spacing={1}>
                <Chip
                  className="mainchip"
                  onClick={this.handleClick}
                  label={
                    row.type === "update"
                      ? "Type: Update"
                      : row.type === "issue"
                      ? "Type: Issue"
                      : ""
                  }
                />
              </Stack>
              <Stack className="space" direction="row" spacing={1}>
                <Chip
                  className="datachip"
                  onClick={this.handleClick}
                  label={
                    row.urgent == 1
                      ? "Urgent"
                      : row.urgent == 0
                      ? "Not Urgent"
                      : ""
                  }
                />
              </Stack>
              <Stack className="space" direction="row" spacing={1}>
                <Chip
                  size="small"
                  className="datechip"
                  icon={<AccessTimeIcon />}
                  label={
                    "Date Created: " +
                    row.datetime.split("T")[0] +
                    " " +
                    row.datetime.split("T")[1].split(".")[0]
                  }
                />
              </Stack>

              <Divider className="divider" />
            </Paper>
          </Grid>
        ))}
      </React.Fragment>
    );
  }
}
export default withCookies(Orders);
