import React, { useContext, useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import makeStyles from '@mui/styles/makeStyles';

import PlayerContext from '../../../context/player/context';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

export default function RebootDialog() {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [waitingForReboot, setWaitingForReboot] = React.useState(false);
  const [showError, setShowError] = useState(false);

  const { state: { postJukeboxCommand } } = useContext(PlayerContext);

  const checkIfBackendIsAvailable = () => {
    const checkingInterval = setInterval(async () => {
      try {
        await postJukeboxCommand('player', 'ctrl', 'playerstatus');
        setDialogOpen(false);
        setWaitingForReboot(false);
        clearInterval(checkingInterval);
      }
      catch(error) {
        setWaitingForReboot(true);
        console.log('waiting for reboot');
      }
    }, 15000);
  }

  const handleClickOpen = () => {
    setDialogOpen(true);
  };

  const handleCancelReboot = () => {
    setDialogOpen(false);
  };

  const doReboot = async () => {
    try {
      await postJukeboxCommand('host', 'reboot');
      setWaitingForReboot(true);
      checkIfBackendIsAvailable();
    }
    catch(error) {
      setWaitingForReboot(false);
      setShowError(true);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClickOpen}>Reboot</Button>
      <Dialog
        open={dialogOpen}
        onClose={handleCancelReboot}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {!waitingForReboot && "Reboot"}
          {waitingForReboot && "Rebooting"}
        </DialogTitle>
        <DialogContent>
          {
            !waitingForReboot &&
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to reboot your Phoniebox now?
            </DialogContentText>
          }

          {
            waitingForReboot &&
            <Grid container spacing={2}>
              <Grid item xs={12} justifyContent="center">
                <CircularProgress />
              </Grid>
            </Grid>
          }

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReboot} color="secondary">
            Cancel
          </Button>
          <Button onClick={doReboot} color="primary" autoFocus>
            Reboot
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        id="error"
        open={showError}
        autoHideDuration={5000}
        onClose={handleCloseError}
        message="Reboot failed"
      />
    </>
  );
}