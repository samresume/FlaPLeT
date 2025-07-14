import React, { Component } from "react";
import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import StraightenIcon from "@mui/icons-material/Straighten";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LinearProgress from "@mui/material/LinearProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Pagination from "@mui/material/Pagination";
import { withCookies } from "react-cookie";
import DownloadIcon from "@mui/icons-material/Download";
import AnalyticsIcon from "@mui/icons-material/Analytics";

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
      pagination_max: 1,
      pagination_current: 1,
      max_content: 10,
      content_count: 0,
      pagination_floor: 0,
      pagination_ceil: 1,
      downloadDialogOpen: false,
      selectedDatasetId: null,
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
      .then((res) => {
        this.setState({
          experiments: res.data,
          content_count: res.data.length,
          pagination_max: Math.ceil(res.data.length / this.state.max_content),
          pagination_floor:
            (this.state.pagination_current - 1) * this.state.max_content,
          pagination_ceil:
            this.state.pagination_current * this.state.max_content + 1,
        });
      });
  }

  handleClickOpen = (id) => {
    this.setState({ open: true, delete: { dataset_id: id } });
  };

  handleDelete = () => {
    fetch("https://api.flaplet.org/solarflare/dataset/delete_dataset/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.state.token}`,
      },
      body: JSON.stringify(this.state.delete),
    })
      .then((resp) => resp.json())
      .then((res) => {
        this.setState({
          experiments: res.data,
          open: false,
          snackbar: true,
        });
      });
  };

  handlePagination = (event, value) => {
    this.setState({
      pagination_current: value,
      pagination_floor: (value - 1) * this.state.max_content,
      pagination_ceil: value * this.state.max_content + 1,
    });
  };

  snackClose = () => this.setState({ snackbar: false });

  handleClose = () => this.setState({ open: false });

  handleDownloadOpen = (datasetId) => {
    this.setState({ downloadDialogOpen: true, selectedDatasetId: datasetId });
  };

  handleDownloadClose = () => {
    this.setState({ downloadDialogOpen: false, selectedDatasetId: null });
  };

  handleDownloadFile = (which) => {
    fetch("https://api.flaplet.org/solarflare/dataset/get_file/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.state.token}`,
      },
      body: JSON.stringify({
        dataset_id: this.state.selectedDatasetId,
        which: which,
      }),
    })
      .then((resp) =>
        Promise.all([resp.blob(), resp.headers.get("Content-Disposition")])
      )
      .then(([blob, name]) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = String(name).split('"')[1];
        a.click();
        this.handleDownloadClose();
      })
      .catch(() => this.handleDownloadClose());
  };

  handleDownloadReport = (datasetId) => {
    fetch("https://api.flaplet.org/solarflare/dataset/get_file/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.state.token}`,
      },
      body: JSON.stringify({
        dataset_id: datasetId,
        which: "result",
      }),
    })
      .then((resp) =>
        Promise.all([resp.blob(), resp.headers.get("Content-Disposition")])
      )
      .then(([blob, name]) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = String(name).split('"')[1];
        a.click();
      })
      .catch(() => {
        alert("Report file could not be downloaded.");
      });
  };

  render() {
    if (this.state.access !== "1" || !this.state.token) return null;
    return (
      <React.Fragment>
        <div className="graph-header">
          <h2 className="h2">Datasets</h2>
        </div>

        <Fab
          className="fab"
          color="primary"
          variant="extended"
          size="medium"
          onClick={() =>
            (window.location.href = `${process.env.PUBLIC_URL}/new-dataset`)
          }
        >
          <AddIcon sx={{ mr: 1 }} />
          New Dataset
        </Fab>

        {this.state.experiments
          .slice(this.state.pagination_floor, this.state.pagination_ceil - 1)
          .map((row) => (
            <Grid key={row.id} item xs={12}>
              <Accordion sx={{ p: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1}>
                    <Typography className="title" variant="h6">
                      {row.dataset_name}
                    </Typography>
                    <Typography
                      variant="overline"
                      className={
                        row.status === "completed"
                          ? "green margin"
                          : row.status === "failed"
                          ? "red margin"
                          : "blue margin"
                      }
                    >
                      ({row.status})
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" className="description">
                    {row.description}
                  </Typography>

                  <Stack direction="row" spacing={1} className="space">
                    <Chip
                      label={`Missing Value Method: ${
                        row.missing_value === "mean"
                          ? "Mean Imputation"
                          : "Remove Missing Samples"
                      }`}
                      className="datasetchip"
                    />
                    <Chip
                      label={`Normalization: ${
                        row.normalization === "zscore"
                          ? "Z-Score"
                          : row.normalization === "minmax"
                          ? "Min-Max"
                          : "None"
                      }`}
                      className="datasetchip"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} className="space">
                    <Chip
                      size="small"
                      className="resultchip"
                      icon={<FilePresentIcon />}
                      label={`X File: ${row.x_train.name}`}
                    />
                    <Chip
                      size="small"
                      className="resultchip"
                      icon={<StraightenIcon />}
                      label={`Size: ${row.x_train.volume}`}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} className="space">
                    <Chip
                      size="small"
                      className="resultchip"
                      icon={<FilePresentIcon />}
                      label={`Y File: ${row.y_train.name}`}
                    />
                    <Chip
                      size="small"
                      className="resultchip"
                      icon={<StraightenIcon />}
                      label={`Size: ${row.y_train.volume}`}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} className="space">
                    <Chip
                      size="small"
                      className="datechip"
                      icon={<AccessTimeIcon />}
                      label={`Uploaded: ${row.datetime.split("T")[0]} ${
                        row.datetime.split("T")[1].split(".")[0]
                      }`}
                    />
                    {row.status === "completed" && (
                      <Chip
                        size="small"
                        className="datechip"
                        icon={<AccessTimeIcon />}
                        label={`Finished: ${
                          row.report_datetime.split("T")[0]
                        } ${row.report_datetime.split("T")[1].split(".")[0]}`}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {row.status !== "completed" && row.status !== "failed" && (
                    <LinearProgress className="progress-bar" />
                  )}
                  {row.status === "completed" && (
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<AnalyticsIcon />}
                        onClick={() => this.handleDownloadReport(row.id)}
                      >
                        Download Statistical Report
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<DownloadIcon />}
                        onClick={() => this.handleDownloadOpen(row.id)}
                      >
                        Download Processed Dataset
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        variant="outlined"
                        onClick={() => this.handleClickOpen(row.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  )}

                  {row.status === "failed" && (
                    <>
                      <Typography
                        variant="body2"
                        sx={{ color: "tomato", mb: 1, fontWeight: "bold" }}
                      >
                        Something went wrong!
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          variant="outlined"
                          onClick={() => this.handleClickOpen(row.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        {this.state.experiments.length === 0 && (
          <div className="no-task-message">
            No task has been created yet. Start by clicking the button in the
            bottom right corner.
          </div>
        )}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <Stack alignItems="center">
            <Pagination
              count={this.state.pagination_max}
              page={this.state.pagination_current}
              onChange={this.handlePagination}
              variant="outlined"
              size="large"
              color="secondary"
            />
          </Stack>
        </Grid>

        <Dialog
          open={this.state.downloadDialogOpen}
          onClose={this.handleDownloadClose}
        >
          <DialogTitle>Select File to Download</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Choose whether you want to download the Training Data or Labels
              file.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.handleDownloadFile("x_train")}
              color="primary"
              variant="contained"
            >
              Training Data
            </Button>
            <Button
              onClick={() => this.handleDownloadFile("y_train")}
              color="primary"
              variant="contained"
            >
              Labels
            </Button>
            <Button onClick={this.handleDownloadClose} color="error">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={this.state.open} onClose={this.handleClose}>
          <DialogTitle>Delete Dataset</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this dataset? Files will be
              permanently removed.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.handleDelete} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={this.state.snackbar}
          autoHideDuration={5000}
          onClose={this.snackClose}
        >
          <Alert
            onClose={this.snackClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Dataset deleted successfully.
          </Alert>
        </Snackbar>
      </React.Fragment>
    );
  }
}

export default withCookies(Orders);
