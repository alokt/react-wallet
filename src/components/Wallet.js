import React from "react";
import { ethers } from 'ethers';
import { NotificationTypes, createKovanSdk } from 'abridged';

import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";


// var styles = {
//   fixedWidthForm: {
//     width: "500px !important",
//     padding: "20px",
//     position: "absolute",
//     left: "50%",
//     transform: "translate(-50%, -35%)",
//     top: "35%",
//     height: "50vh",
//     boxSizing: "border-box",
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "space-around",
//   }
// };

class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.sdk = null;
    const urlParams = new URLSearchParams(this.props.location.search);
    const recordId = urlParams.get('id');
    const server_url = urlParams.get('url');
    const accountAddress = urlParams.get('account');
    this.state = {
      accountAddress: accountAddress,
      authKey: "",
      externalDepositAddress: "",
      address: "",
      balance: 0,
      description: 'Please wait...'
    };
    this.handelFormSubmit = this.handelFormSubmit.bind(this);
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handelFormSubmit = event => {
    event.preventDefault();
    console.log(this.state.address);
    this.transfer();
  };

  async init() {
    try {
      const REACT_APP_INFURA_PROJECT_ID = "7acf175321ac4b3cba908ec2111dc297";
      const STORAGE_PRIVATE_KEY = 'STORAGE_PRIVATE_KEY';
      const privateKey = localStorage.getItem(STORAGE_PRIVATE_KEY);
      this.sdk = createKovanSdk({
        authKeyModule: {
          privateKey
        },
        queryProviderEndpoint: REACT_APP_INFURA_PROJECT_ID
          ? `https://kovan.infura.io/v3/${REACT_APP_INFURA_PROJECT_ID}`
          : 'https://kovan.infura.io',
      });
      if (!privateKey) {
        this.sdk
          .exportPrivateKey()
          .then(privateKey => localStorage.setItem(STORAGE_PRIVATE_KEY, privateKey))
          .catch(() => null);
      }
    } catch (err) {
      console.log("error initilizing..", err);
      return null;
    }
  }

  async componentDidMount() {
    await this.init();
    console.log('old account', this.state.accountAddress);
    let account = await this.sdk.createAccount(this.state.accountAddress);
    console.log('new account', account);
    if (account) {
      this.setState({
        accountAddress: account.address,
        externalDepositAddress: account.externalDepositAddress,
        balance: 0,
        description: 'Sign trx to trf 0.01 eth to address below'
      });
    }
  }

  async transfer() {
    this.listener();
    const options = {
      recipient: this.state.address,
      value: ethers.utils.parseEther('0.1'),
      data: '0x',
    };
    try {
      await this.sdk.batchExecuteAccountTransaction(options)
      await this.sdk.estimateBatch();
      let result = await this.sdk.submitBatch();
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }

  listener() {

    // const resultPromise = new Promise((resolve, reject) => {
    this.sdk
      .state$
      .notification$
      .subscribe(notification => {
        console.log("subscribe")
        if (notification === null) {
          return;
        }
        if (notification.type === NotificationTypes.RelayedTransactionUpdated && notification.payload.state === 'Sending') {
          console.log('trx hash ' + notification.payload.hash);
          // subscribtion.unsubscribe();
          return;
        }
      });
    // })
  }

  render() {
    return (
      <Container maxWidth="sm">
        <Grid container item spacing={2} xs={12} lg={4} wrap="nowrap">
          <Card
            className="form-container fixed-width-form"

          >
            <div className="cardHeader">
              <Typography
                component="h6"
                variant="h6"
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  letterSpacing: "1px"
                }}
              >
                Abridged Wallet
              </Typography>
            </div>
            <div className="">
              <Typography
                component="h6"
                variant="h6"
                style={{
                  textAlign: "center",
                }}
              >
                {this.state.description}
              </Typography>
              <form
                onSubmit={this.handelFormSubmit}
                style={{ marginTop: "12px" }}
                noValidate
              >
                <TextField
                  type="text"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Address"
                  id="address"
                  name="address"
                  value={this.state.address}
                  onChange={this.onChange}
                  style={{
                    marginTop: "8px"
                  }}
                  required
                  size="medium"
                  inputProps={{ min: "0" }}
                />
                <div style={{ display: "flex" }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="medium"
                    style={{
                      marginTop: "200px",
                      padding: "10px 30px"
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </Grid>
      </Container>
    );
  }
}
export default Wallet;
