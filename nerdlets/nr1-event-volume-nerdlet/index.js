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
      eventVolumes: [],
    };
  }
  
  componentDidMount() {
    this.updateData(this.props)
  }
    
  updateData = props => {
    const { accountId } = this.state;
    
    this.setState({ accountId}, () =>{
      if (accountId) {
        NrqlQuery.query({
          accountId,
          query: 'SHOW eventTypes'
        })
        .then(value => {
          console.debug("Event Types", value)
          const eventTypes = value.data[0].data[0].eventTypes
          const eventTypeQueries = eventTypes.map((eventType) => 
            NrqlQuery.query({
              accountId,
              query: `FROM \`${eventType}\` SELECT bytecountestimate()`
            })
          );
          // console.debug('eventTypeQueries', eventTypeQueries)
          
          Promise.all(eventTypeQueries).then((values) => {
            const eventVolumes = [];
            values.forEach((value, i) => {
              // console.debug("Promise", value) 
              console.debug("Data", eventTypes[i], value.data[0].data[0].bytecountestimate)
              eventVolumes.push({
                eventType: eventTypes[i],
                bytecountestimate: value.data[0].data[0].bytecountestimate
              });
            });
            this.setState({ eventVolumes })
          })
        });
      }
    })
  };
    
    
  
  render() {
    console.debug("State: ", this.state)
    const { accountId, eventVolumes } = this.state;
    //console.debug(accountId, eventVolume)
    
    //{ eventVolume && console.debug("Render Results", eventVolume) }
    
    return (
      <div>
        <pre>{JSON.stringify(eventVolumes, null, 4)}</pre>
      </div>
    );
  }
}
