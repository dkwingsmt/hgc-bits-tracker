import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import Chart from 'chart.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastUpdateTime: null
    };
  }

  componentDidMount() {
    fetch(`${process.env.PUBLIC_URL}/data.json`)
    .then(response => response.json())
    .then((table) => {
      const [header, ...body] = table;
      return _.fromPairs(_.zip(header, ...body).map(line => [line[0], line.slice(1)]));
    })
    .then((tableData) => {
      const { date,     // eslint-disable-line no-unused-vars
        time, progression, ...lines } = tableData;
      this.setState({ lastUpdateTime: _.last(time) });
      const ctx = document.getElementById('myChart').getContext('2d');
      const chart = new Chart(ctx, { // eslint-disable-line no-unused-vars
        // The type of chart we want to create
        type: 'line',
        // The data for our dataset
        data: {
          labels: time,
          datasets: [{
            label: 'Overall',
            data: progression,
            yAxisID: 'y-axis-1',
            pointBorderColor: 'rgb(0, 0, 255)',
            fill: false
          }].concat(_.map(lines, (data, label) => ({
            label,
            yAxisID: 'y-axis-0',
            fill: false,
            data
          })))
        },

        options: {
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                displayFormats: {
                  'hour': 'MMM D, h:00A'
                }
              }
            }],
            yAxes: [{
              'position': 'left',
              'id': 'y-axis-0'
            }, {
              'position': 'right',
              'id': 'y-axis-1'
            }]
          }
        }
      });
    });
  }

  render() {
    const { lastUpdateTime } = this.state;
    return (
      <div className="App">
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a>HGC Bits Tracker</a>
            </Navbar.Brand>
          </Navbar.Header>
          <Nav>
            <NavItem>{lastUpdateTime ? `Last update time: ${moment(lastUpdateTime).format('MMM D, h:mmA')}` : ''}</NavItem>
          </Nav>
        </Navbar>
        <div style={{ maxWidth: 800, margin: 'auto' }}>
          <canvas id="myChart" />
        </div>
      </div>
    );
  }
}

export default App;
