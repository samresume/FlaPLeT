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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import CelebrationIcon from "@mui/icons-material/Celebration";

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
        project_id: -1,
      },
      pagination_max: 1,
      pagination_current: 1,
      max_content: 10,
      content_count: 0,
      pagination_floor: 0,
      pagination_ceil: 1,
    };
  }

  componentDidMount() {
    if (this.state.token) {
      fetch("https://api.flaplet.org/solarflare/project/get_projects", {
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
        })
        .catch(() => {});
    } else {
      window.location.href = `${process.env.PUBLIC_URL}/login`;
    }
  }

  handleClickOpen = (id) => {
    this.setState({ open: true, delete: { project_id: id } });
  };

  handleClickOpen = (id) => {
    this.setState({ open: true, delete: { project_id: id } });
  };

  handleDelete = () => {
    fetch("https://api.flaplet.org/solarflare/project/delete_project/", {
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

  snackClose = () => this.setState({ snackbar: false });

  handleClose = () => this.setState({ open: false });

  handlePagination = (event, value) => {
    this.setState({
      pagination_current: value,
      pagination_floor: (value - 1) * this.state.max_content,
      pagination_ceil: value * this.state.max_content + 1,
    });
  };

  handleDownloadFile = (projectId, which) => {
    fetch("https://api.flaplet.org/solarflare/project/get_file/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${this.state.token}`,
      },
      body: JSON.stringify({
        project_id: projectId,
        which: which, // 'model' or 'result'
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
        alert("Download failed. File not found or server error.");
      });
  };

  render() {
    if (this.state.access !== "1" || !this.state.token) return null;

    return (
      <React.Fragment>
        <div className="graph-header">
          <h2 className="h2">ML Sessions</h2>
        </div>

        <Fab
          className="fab"
          color="primary"
          variant="extended"
          size="medium"
          onClick={() =>
            (window.location.href = `${process.env.PUBLIC_URL}/new-session`)
          }
        >
          <AddIcon sx={{ mr: 1 }} />
          New ML Session
        </Fab>
        {this.state.experiments
          .slice(this.state.pagination_floor, this.state.pagination_ceil - 1)
          .map((row) => (
            <Grid key={row.id} item xs={12}>
              <Accordion sx={{ p: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1}>
                    <Typography className="title" variant="h6">
                      {row.project_name}
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
                    {row.data_info && (
                      <Chip className="datasetchip" label="Uploaded Dataset" />
                    )}
                    {row.data_aug_info && (
                      <Chip className="datasetchip" label="Augmented Dataset" />
                    )}
                    {row.fn_data_info && (
                      <Chip className="datasetchip" label="Graph Dataset" />
                    )}

                    {/* Dataset Title */}
                    {row.data_info && (
                      <Chip
                        className="datasetchip"
                        label={`Name: ${row.data_info.dataset_name}`}
                      />
                    )}
                    {row.data_aug_info && (
                      <Chip
                        className="datasetchip"
                        label={`Name: ${row.data_aug_info.dataset_name}`}
                      />
                    )}
                    {row.fn_data_info && (
                      <Chip
                        className="datasetchip"
                        label={`Name: ${row.fn_data_info.dataset_name}`}
                      />
                    )}

                    {/* Uploaded Dataset Fields */}
                    {row.data_info && (
                      <>
                        <Chip
                          className="datasetchip"
                          label={`Normalization: ${
                            row.data_info.normalization === "zscore"
                              ? "Z-Score"
                              : row.data_info.normalization === "minmax"
                              ? "Min-Max"
                              : "None"
                          }`}
                        />
                        <Chip
                          className="datasetchip"
                          label={`Missing Value: ${
                            row.data_info.missing_value === "mean"
                              ? "Mean Imputation"
                              : "Remove Missing Samples"
                          }`}
                        />
                      </>
                    )}

                    {/* Augmented Dataset Fields */}
                    {row.data_aug_info && (
                      <>
                        <Chip
                          className="datasetchip"
                          label={`Technique: ${
                            row.data_aug_info.data_augmentation === "smote"
                              ? "SMOTE"
                              : "TimeGAN"
                          }`}
                        />
                        {row.data_aug_info.data_augmentation === "smote" &&
                          row.data_aug_info.k_neighbors != null && (
                            <Chip
                              className="datasetchip"
                              label={`SMOTE Neighbors: ${row.data_aug_info.k_neighbors}`}
                            />
                          )}
                      </>
                    )}

                    {/* Graph Dataset Fields */}
                    {row.fn_data_info && (
                      <>
                        {row.fn_data_info.pearson != null && (
                          <Chip
                            className="datasetchip"
                            label={`Pearson Threshold: ${row.fn_data_info.pearson}`}
                          />
                        )}
                        {row.fn_data_info.max_neighbor != null && (
                          <Chip
                            className="datasetchip"
                            label={`Max Neighbor: ${row.fn_data_info.max_neighbor}`}
                          />
                        )}
                      </>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} className="space">
                    <Chip
                      className="mainchip"
                      label={`Task: ${
                        row.project_info.task === "supervised"
                          ? "Supervised"
                          : "Unsupervised"
                      }`}
                    />
                    <Chip
                      className="mainchip"
                      label={`Learning Type: ${
                        row.project_info.learning_type === "classification"
                          ? "Classification"
                          : row.project_info.learning_type === "regression"
                          ? "Regression"
                          : "Clustering"
                      }`}
                    />
                    <Chip
                      className="mainchip"
                      label={`ML Model: ${row.project_info.ml_model.toUpperCase()}`}
                    />
                    <Chip
                      className="mainchip"
                      label={`Train/Test Split: ${row.project_info.train_split}%`}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} className="space">
                    {row.project_info.ml_model === "gru" && (
                      <>
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Learning Rate: ${row.project_info.learning_rate}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Num Layers: ${row.project_info.num_layers}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Dropout Rate: ${row.project_info.dropout_rate}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Batch Size: ${row.project_info.batch_size}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Hidden Size: ${row.project_info.hidden_size}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Epochs: ${row.project_info.epochs}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Optimizer: ${row.project_info.optimization.toUpperCase()}`}
                        />
                      </>
                    )}

                    {row.project_info.ml_model === "svm" && (
                      <>
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Kernel: ${row.project_info.kernel.toUpperCase()}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Regularization: ${row.project_info.regularization_strength}`}
                        />
                      </>
                    )}

                    {row.project_info.ml_model === "node2vec" && (
                      <>
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Dimensions: ${row.project_info.dimensions}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Walk Length: ${row.project_info.walk_length}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Num Walks: ${row.project_info.num_walks}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Window Size: ${row.project_info.window_size}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Batch Word: ${row.project_info.batch_word}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Penalty: ${row.project_info.penalty.toUpperCase()}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Solver: ${row.project_info.solver.toUpperCase()}`}
                        />
                        <Chip
                          size="small"
                          className="hyperchip"
                          variant="outlined"
                          label={`Max Iter: ${row.project_info.max_iter}`}
                        />
                      </>
                    )}
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
                        icon={<AccessAlarmIcon />}
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
                      {/* Download the Report (redirects to report page) */}
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<AnalyticsIcon />}
                        onClick={() =>
                          this.handleDownloadFile(row.id, "result")
                        }
                      >
                        Download Classification Report
                      </Button>

                      {/* Download the Model */}
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<DownloadIcon />}
                        onClick={() => this.handleDownloadFile(row.id, "model")}
                      >
                        Download the Model
                      </Button>

                      {/* Delete Session */}
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

        <Dialog open={this.state.open} onClose={this.handleClose}>
          <DialogTitle>Delete Session</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this session? Files and results
              will be permanently removed.
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
            ML session deleted successfully.
          </Alert>
        </Snackbar>
      </React.Fragment>
    );
  }
}

export default withCookies(Orders);
