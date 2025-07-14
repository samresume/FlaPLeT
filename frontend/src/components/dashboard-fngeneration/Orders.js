import React, { Component } from "react";
import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  Pagination,
  LinearProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  FilePresent as FilePresentIcon,
  Straighten as StraightenIcon,
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { withCookies } from "react-cookie";

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
      token,
      access,
      open: false,
      snackbar: false,
      delete: { dataset_id: -1 },
      downloadDialogOpen: false,
      selectedDatasetId: null,
      pagination_max: 1,
      pagination_current: 1,
      max_content: 10,
      pagination_floor: 0,
      pagination_ceil: 1,
    };
  }

  componentDidMount() {
    if (this.state.token) {
      fetch("https://api.flaplet.org/solarflare/fn-dataset/get_info", {
        method: "GET",
        headers: {
          Authorization: `Token ${this.state.token}`,
        },
      })
        .then((resp) => resp.json())
        .then((res) => {
          this.setState({
            experiments: res.data,
            pagination_max: Math.ceil(res.data.length / this.state.max_content),
            pagination_floor: 0,
            pagination_ceil: this.state.max_content + 1,
          });
        });
    }
  }

  handleClickOpen = (id) => {
    this.setState({ open: true, delete: { dataset_id: id } });
  };

  handleDelete = () => {
    fetch("https://api.flaplet.org/solarflare/fn-dataset/delete_dataset/", {
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
      })
      .catch(() => this.setState({ open: false }));
  };

  handleDownloadReport = (datasetId) => {
    this.downloadDataset(datasetId, null, "result");
  };

  handleDownloadOpen = (datasetId) => {
    this.setState({ downloadDialogOpen: true, selectedDatasetId: datasetId });
  };

  handleDownloadClose = () => {
    this.setState({ downloadDialogOpen: false, selectedDatasetId: null });
  };

  downloadDataset = (datasetId, e, which) => {
    fetch("https://api.flaplet.org/solarflare/fn-dataset/get_file/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.state.token}`,
      },
      body: JSON.stringify({ dataset_id: datasetId, which }),
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
        this.setState({ downloadDialogOpen: false });
      })
      .catch(() => {
        this.setState({ downloadDialogOpen: false });
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

  render() {
    if (this.state.access !== "1" || !this.state.token) return null;

    return (
      <>
        <div className="graph-header">
          <h2 className="h2">Graph Generation</h2>
        </div>

        <Fab
          className="fab"
          color="primary"
          variant="extended"
          size="medium"
          onClick={() =>
            (window.location.href = `${process.env.PUBLIC_URL}/new-graph`)
          }
        >
          <AddIcon sx={{ mr: 1 }} />
          New Graph Generation
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
                    {/* Dataset Type */}
                    {row.mvts_dataset && (
                      <Chip className="datasetchip" label="Uploaded Dataset" />
                    )}
                    {row.aug_dataset && (
                      <Chip className="datasetchip" label="Augmented Dataset" />
                    )}

                    {/* Dataset Title */}
                    {row.mvts_dataset && (
                      <Chip
                        className="datasetchip"
                        label={`Name: ${row.mvts_dataset.dataset_name}`}
                      />
                    )}
                    {row.data_aug_info && (
                      <Chip
                        className="datasetchip"
                        label={`Name: ${row.aug_dataset.dataset_name}`}
                      />
                    )}

                    {/* Uploaded Dataset Fields */}
                    {row.mvts_dataset && (
                      <>
                        <Chip
                          className="datasetchip"
                          label={`Normalization: ${
                            row.mvts_dataset.normalization === "zscore"
                              ? "Z-Score"
                              : row.mvts_dataset.normalization === "minmax"
                              ? "Min-Max"
                              : "None"
                          }`}
                        />
                        <Chip
                          className="datasetchip"
                          label={`Missing Value: ${
                            row.mvts_dataset.missing_value === "mean"
                              ? "Mean Imputation"
                              : "Remove Missing Samples"
                          }`}
                        />
                      </>
                    )}

                    {/* Augmented Dataset Fields */}
                    {row.aug_dataset && (
                      <>
                        <Chip
                          className="datasetchip"
                          label={`Technique: ${
                            row.aug_dataset.data_augmentation === "smote"
                              ? "SMOTE"
                              : "TimeGAN"
                          }`}
                        />
                        {row.aug_dataset.data_augmentation === "smote" &&
                          row.aug_dataset.k_neighbors != null && (
                            <Chip
                              className="datasetchip"
                              label={`SMOTE Neighbors: ${row.aug_dataset.k_neighbors}`}
                            />
                          )}
                      </>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} className="space">
                    <Chip
                      className="mainchip"
                      label={`Pearson's Correlation > ${row.pearson}`}
                    />
                    <Chip
                      className="mainchip"
                      label={`Max Neighbors: ${row.max_neighbor}`}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} className="space">
                    <Chip
                      size="small"
                      className="datechip"
                      icon={<AccessTimeIcon />}
                      label={`Created: ${row.datetime.split("T")[0]} ${
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
                        Download Graph Dataset
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => this.handleClickOpen(row.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  )}

                  {row.status === "running" && (
                    <LinearProgress className="progress-bar" />
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
          <DialogTitle>Select Graph File to Download</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Choose whether you want to download the Graph Feature Matrix or
              the Labels file.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                this.downloadDataset(
                  this.state.selectedDatasetId,
                  null,
                  "x_train"
                )
              }
              variant="contained"
              color="primary"
            >
              Graph Features
            </Button>
            <Button
              onClick={() =>
                this.downloadDataset(
                  this.state.selectedDatasetId,
                  null,
                  "y_train"
                )
              }
              variant="contained"
              color="primary"
            >
              Graph Labels
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
      </>
    );
  }
}

export default withCookies(Orders);
