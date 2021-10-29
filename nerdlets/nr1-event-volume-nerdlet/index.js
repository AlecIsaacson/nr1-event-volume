//Nerdlet to review all data in an account

import React from 'react';
import { PlatformStateContext, NrqlQuery, Spinner, Table, TableHeader, TableHeaderCell, TableRow, TableRowCell, Stack, StackItem, JsonChart, HeadingText, BlockText, Grid, GridItem, LineChart, NerdGraphQuery } from 'nr1';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class EventVolumeNerdlet extends React.Component {
  constructor(props){
    super(props);
    console.debug("Props", this); //eslint-disable-line
    this.state = {
      accountId: 734056,
      eventVolume: null,
    };
  }
  
  componentDidMount() {
    this.updateData(this.props)
  }
    
  updateData = props => {
    const { accountId } = this.state;
    
    //console.debug("Props", props)
    //console.debug("ID / query", accountId, nrqlQuery)

    //if (accountId !== this.state.accountId) {
      this.setState({ accountId }, () => {
        if (accountId) {
          //console.debug("In query")
          // https://developer.newrelic.com/components/nrql-query
          NrqlQuery.query({
            accountId,
            query: 'SHOW eventTypes'
          })
            .then(value => {
              const eventVolume = [];
              value.data[0].data[0].eventTypes.forEach((item, i) => { 
                //console.debug("Item", item)
                NrqlQuery.query({
                  accountId,
                  query: `FROM \`${item}\` SELECT bytecountestimate()`
                })
                .then(value => {
                  //console.debug("Value", item, value.data[0].data[0].bytecountestimate)
                  eventVolume.push({
                    eventType: item,
                    bytecountestimate: value.data[0].data[0].bytecountestimate
                  });
                })
                .catch(err => {
                  console.debug("Inner Error", err, item)
                })
              });
              // console.debug("Inside Event Volume", eventVolume)
              this.setState({ eventVolume })
            })
            .catch(err => {
              console.debug("Outer Error", err, item)
              //this.setState({ eventVolume: { error: err.message } });
            });
        } else {
          //console.debug("In null")
          this.setState({ eventVolume: null });
        }
      });
    //}
  };
    
  
  render() {
    console.debug("State: ", this.state)
    const { accountId, eventVolume } = this.state;
    //console.debug(accountId, eventVolume)
    
    { eventVolume && console.debug("Render Results", eventVolume) }
    
    return (
      <div>
        { eventVolume && <pre>{JSON.stringify(eventVolume, null, 4)}</pre> }
      </div>
    );
  }
}
