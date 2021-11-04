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
      //column_0: TableHeaderCell.SORTING_TYPE.ASCENDING,
      column_1: TableHeaderCell.SORTING_TYPE.DESCENDING,
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
          //console.debug("Event Types", value)
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
              //console.debug("Data", eventTypes[i], value.data[0].data[0].bytecountestimate)
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
    
  _onClickTableHeaderCell(key, event, sortingData) {
    //console.debug("Header Cell", key, event, sortingData)
    //console.debug("Header Cell", state)
    this.setState({ [key]: sortingData.nextSortingType });
  }
  
  render() {
    console.debug("State: ", this.state)
    const { accountId, eventVolumes, selectedEventType } = this.state;
    //console.debug(accountId, eventVolumes)
    
    
    return (
      <Grid class-name="primary-grid" spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}>
        <GridItem className="primary-content-container" columnSpan={12}>
          <Stack fullWidth directionType={Stack.DIRECTION_TYPE.HORIZONTAL} gapType={Stack.GAP_TYPE.LOOSE}>
            <StackItem grow={true} className="row-spacing">
              <Table items={eventVolumes} className="top-chart">
                <TableHeader>
                  <TableHeaderCell value={({ item }) => item.eventType}
                    sortable
                    sortingOrder={0}
                    sortingType={this.state.column_0}
                    onClick={this._onClickTableHeaderCell.bind(this, 'column_0')}
                    width='3fr'
                  >
                    Event Type
                  </TableHeaderCell>
                  <TableHeaderCell value={({ item }) => item.bytecountestimate}
                    sortable
                    sortingOrder={1}
                    sortingType={this.state.column_1}
                    onClick={this._onClickTableHeaderCell.bind(this, 'column_1')}
                  >
                    Event Vol (GB) 
                  </TableHeaderCell>
                </TableHeader>
                {({ item }) => (
                  <TableRow
                    onClick={(evt, item, index) => {
                      console.debug("Clicked:", item)
                      this.setState({ selectedEventType: item.item.eventType})
                    }}
                  >
                    <TableRowCell>{item.eventType}</TableRowCell>
                    <TableRowCell>{(item.bytecountestimate / 10e8).toFixed(2)}</TableRowCell>
                  </TableRow>
                )}
              </Table>
            </StackItem>
            { selectedEventType && <Stack fullWidth gapType={Stack.GAP_TYPE.LOOSE}>
               <StackItem grow={true} className="row-spacing">
                 <HeadingText style={{marginLeft: '25px'}}>{selectedEventType} Volume Timeseries (bytes)</HeadingText>
                 <LineChart accountId={accountId} className="chart" query={`FROM \`${selectedEventType}\` SELECT bytecountestimate() TIMESERIES`}/>
               </StackItem>
             </Stack>
            }
          </Stack>
        </GridItem>
      </Grid>
    );
  }
}
