//Nerdlet to review all data in an account

import React from "react";
import {
  PlatformStateContext,
  NrqlQuery,
  Spinner,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  Stack,
  StackItem,
  JsonChart,
  HeadingText,
  BlockText,
  Grid,
  GridItem,
  LineChart,
  NerdGraphQuery,
} from "nr1";

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class EventVolumeNerdlet extends React.Component {
  constructor(props) {
    super(props);
    console.debug("Props", this); //eslint-disable-line
    this.state = {
      accountId: 734056,
      eventVolume: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.updateData(this.props);
  }

  updateData = (props) => {
    const { accountId } = this.state;

    this.setState({ accountId }, () => {
      if (accountId) {
        NrqlQuery.query({
          accountId,
          query: "SHOW eventTypes",
        })
          .then((value) => {
            const eventTypes = value.data[0].data[0].eventTypes ?? [];
            // Create an array of NrqlQuery promises
            const eventTypeQueries = eventTypes.map((eventType) =>
              NrqlQuery.query({
                accountId,
                query: `FROM \`${eventType}\` SELECT bytecountestimate()`,
              })
            );

            // Resolve all promises at once
            // 'values' will be an array where each index contains the resolved response object from the query in the promise array; { data, loading, error } where loading will always be false
            Promise.all(eventTypeQueries).then((values) => {
              const eventVolume = [];
              values.forEach((value, i) => {
                if (value.error) {
                  console.debug("this Event type had an error", eventTypes[i]);
                  return;
                }

                const bytecountestimate =
                  value.data[0].data[0].bytecountestimate;
                eventVolume.push({
                  eventType: eventTypes[i],
                  bytecountestimate,
                });
              });

              this.setState({ eventVolume, loading: false });
            });
          })
          .catch((err) => {
            console.debug("Outer Error", err, item);
            this.setState({ loading: false });
          });
      } else {
        this.setState({ loading: false });
      }
    });
  };

  render() {
    const { eventVolume, loading } = this.state;

    if (loading) {
      return <Spinner />;
    }

    if (eventVolume.length === 0) {
      // Update to use EmptyState component with error
      return <div>Something went wrong getting event volume</div>;
    }

    return (
      <div>
        <pre>{JSON.stringify(eventVolume, null, 4)}</pre>
      </div>
    );
  }
}
