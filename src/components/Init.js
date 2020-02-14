import React from "react";
import axios from "axios";
import { ethers } from 'ethers';

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

class Init extends React.Component {
  constructor(props) {
    super(props);
    const urlParams = new URLSearchParams(this.props.location.search);
    const recordId = urlParams.get('id');
    const server_url = urlParams.get('url');
    console.log(recordId, server_url);
    this.state = {
      balance: 0,
      recordId: recordId,
      text: 'Please wait...',
      server_url: server_url
    };
  }

  async init() {
    try {
      const STORAGE_PRIVATE_KEY = 'STORAGE_PRIVATE_KEY';
      const STORAGE_AUTH_KEY = 'auth_storage_key';
      let privateKey = localStorage.getItem(STORAGE_PRIVATE_KEY);
      let wallet;
      // Connect a wallet to mainnet
      if (privateKey) {
        wallet = new ethers.Wallet(privateKey);
      } else {
        wallet = ethers.Wallet.createRandom();
        localStorage.setItem(STORAGE_PRIVATE_KEY, wallet.privateKey);
        localStorage.setItem(STORAGE_AUTH_KEY, wallet.address);
        console.log(wallet.privateKey);
      }
      this.setState({
        "auth_key": wallet.address
      });
      return;
    } catch (err) {
      console.log("error initilizing..", err);
      return null;
    }
  }

  async componentDidMount() {
    await this.init();
    await this.setRecoveryKey();
  }

  setRecoveryKey = async () => {
    const SERVER_URL = this.state.server_url;
    let result = await axios.post(`${SERVER_URL}/setauthkey/`, {
      "id": this.state.recordId,
      "client_auth_key": this.state.auth_key,
    });
    this.setState({
      text: 'Please close this window.'
    });
    alert(result.data);
    window.close();
  };

  render() {
    return (
      <Container >
        <Grid container item >
          <div className="">
            <Typography
              style={{
                textAlign: "center",
              }}
            >
              {this.state.text}
            </Typography>
          </div>

        </Grid>
      </Container>
    );
  }
}
export default Init;
