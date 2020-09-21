const Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');

let accounts;
let oracles = [];
let emitedIdx;
let acceptedOracles = [];
var sor;

// Watch contract events
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const TEST_ORACLES_COUNT = 20;
var config;


contract('Oracles', async (accnts) => {
  accounts = accnts;
});

before(async () => {
  config = await Test.Config(accounts);
});

  it('can register oracles', async () => {
    
    // ARRANGE
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

    // ACT
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {      
      await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee });
      let result = await config.flightSuretyApp.getMyIndexes({from: accounts[a]});
      oracles.push({
        address: accounts[a],
        index: result
      });
      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
    }
  });

  it('can request flight status', async () => {
    // ARRANGE
    let flight = 'ND1309'; // Course number
    let timestamp = Math.floor(Date.now() / 1000);

    // Submit a request for oracles to get status information for a flight
    const resp = await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);
    // ACT

    truffleAssert.eventEmitted(resp, "OracleRequest", (event) => {
      emitedIdx = event.index
      return event.flight === flight
    })

    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    /*oracles.forEach(oracle => {
      if(oracle.index[0].toNumber() || oracle.index[1].toNumber() || oracle.index[2].toNumber()) {
        
      }
    })*/

    oracles.forEach(oracle => {

      if(oracle.index[0].toNumber() === emitedIdx.toNumber()) {
        oracle.idx = oracle.index[0].toNumber()
        acceptedOracles.push(oracle)
      } 
      else if(oracle.index[1].toNumber() === emitedIdx.toNumber()) {
        oracle.idx = oracle.index[1].toNumber()
        acceptedOracles.push(oracle)
      } 
      else if(oracle.index[2].toNumber() === emitedIdx.toNumber()) {
        oracle.idx = oracle.index[2].toNumber()
        acceptedOracles.push(oracle)
      }
    })

    console.log(`Lenght of oracles responses is: ${acceptedOracles.length} \n`)

    for(let i=0; i < acceptedOracles.length; i++) {

      sor = await config.flightSuretyApp.submitOracleResponse(acceptedOracles[i].idx, config.firstAirline, flight, timestamp, STATUS_CODE_ON_TIME, {from: acceptedOracles[i].address});
      
      if(i > 2) {

        truffleAssert.eventEmitted(sor, "FlightStatusInfo", (event) => {
          return event.airline === config.firstAirline
        })
      }
    }
    
    /*for(let a=1; a<TEST_ORACLES_COUNT; a++) {
      // Get oracle information1x 
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});

      for(let idx=0;idx<3;idx++) {

        try {
          // Submit a response...it will only be accepted if there is an Index match
          await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_ON_TIME, { from: accounts[a] });

        }
        catch(e) {
          //console.log(e)
          // Enable this when debugging
          // console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
        }

      }
    }*/

  });