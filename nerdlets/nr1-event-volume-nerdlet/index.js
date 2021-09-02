//Nerdlet to review all data in an account

import React from 'react';
import { NrqlQuery, Spinner, Table, TableHeader, TableHeaderCell, TableRow, TableRowCell, Stack, StackItem, JsonChart, HeadingText, BlockText, Grid, GridItem } from 'nr1';

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class EventVolumeNerdlet extends React.Component {
  constructor(props){
    super(props);
    this.accountId = 734056;
    this.state = {
      appGuid: null,
      appName: null,
      appSLO: null,
    };
    console.debug("Props", props); //eslint-disable-line
  }
  
  
  render() {
    const eventTypeQuery = `SHOW eventTypes`
    return(
      <Grid class-name="primary-grid" spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}>
        <GridItem className="primary-content-container" columnSpan={12}>
          <Stack fullWidth directionType={Stack.DIRECTION_TYPE.HORIZONTAL} gapType={Stack.GAP_TYPE.LOOSE}>
            <StackItem grow={true} className="row-spacing">
            <HeadingText style={{marginLeft: '25px'}}>Event Types in this Account</HeadingText>
              <NrqlQuery accountId={this.accountId} query={eventTypeQuery}>
                {({loading, error, data}) => {
                  if (loading) return <Spinner />
                  if (error) return <BlockText>{error.message}</BlockText>
                  if (data) {
                    console.debug('Raw Data:', data[0].data[0])
                    // data[0].data[0].eventTypes.forEach((item, i) => {
                    //   console.debug('Item:', item);
                    // });
                  }
                  return(
                    <Table items={data[0].data[0].eventTypes} className="top-chart">
                      <TableHeader>
                        <TableHeaderCell
                          value={({ item }) => console.debug('Item:', item)}
                        >
                          Event Type
                        </TableHeaderCell>
                        <TableHeaderCell>
                          Amount of Data 
                        </TableHeaderCell>
                      </TableHeader>
                      {({ item }) => (
                        <TableRow onClick={(evt, item, index) => {
                          console.debug("Clicked:", item)
                        }}>
                          <TableRowCell>
                            {item}
                          </TableRowCell>
                          <TableRowCell alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}>
                            <NrqlQuery accountId={this.accountId} query={`FROM \`${item}\` SELECT bytecountestimate()`}>
                              {({ data, loading, error }) => {
                                if (loading) return <Spinner />
                                if (error) return <BlockText>{error.message}</BlockText>
                                if (data) {
                                  //console.debug('Volume data:', data[0].data[0].bytecountestimate)
                                }
                                return(data[0].data[0].bytecountestimate)
                              }}
                            </NrqlQuery>
                          </TableRowCell>  
                        </TableRow>
                      )
                    }
                    </Table>
                  );
                }}
              </NrqlQuery> 
            </StackItem>
          </Stack>
        </GridItem>
      </Grid>
    );
  }
}
