import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import Chart from 'chart.js';

const INIT_SHOW_TEAMS = 10;

const teams = {
  'blsm': 'Team BlossoM',
  'ce': 'CE',
  'dig': 'Team Dignitas',
  'eid': 'Even In Death',
  'estar': 'eStar',
  'exp': 'Team Expert',
  'fnc': 'Fnatic',
  'gfe': 'Gale Force Esports',
  'kt': 'KT',
  'ldy': 'HotsLady',
  'lfive': 'L5',
  'mty': 'Mighty',
  'mvpb': 'MVP Black',
  'mvpm': 'MVP Miracle',
  'nav': 'Team Naventic',
  'nt': 'No Tomorrow',
  'pd': 'Playing Ducks',
  'roll': 'Roll20 esports',
  'rpg': 'RPG',
  'rrr': 'RRR',
  'rvn': 'Raven',
  'soa': 'SOA',
  'spt': 'SPT',
  'sss': 'Superstars',
  'tf': 'Team Freedom',
  'tgg': 'Team Good Guys',
  'tl': 'Team Liquid',
  'tmp': 'Tempest',
  'trk': 'Tricked eSports',
  'ts': 'Tempo Storm',
  'wkg': 'WKG',
  'zlt': 'Zealots'
};

const colors = ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572',
  '#FF9655', '#FFF263', '#6AF9C4'];

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
        time, progression, ...linesObject } = tableData;
      this.setState({ lastUpdateTime: _.last(time) });

      const lines = _.sortBy(_.toPairs(linesObject),
        ([_label, data]) => -_.last(data));

      this.teams = _.map(lines, ([label]) => label);

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
            pointBorderColor: '#09469c',
            pointStyle: 'triangle',
            fill: false
          }].concat(_.map(lines, ([label, data], i) => ({
            hidden: i >= INIT_SHOW_TEAMS,
            label: teams[label],
            yAxisID: 'y-axis-0',
            fill: false,
            pointStyle: 'rectRot',
            borderColor: colors[i % colors.length],
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
              },
              ticks: {
                minRotation: 30
              }
            }],
            yAxes: [{
              'position': 'left',
              'id': 'y-axis-0',
              'scaleLabel': {
                'display': true,
                'labelString': 'Team bits'
              }
            }, {
              'position': 'right',
              'id': 'y-axis-1',
              'scaleLabel': {
                'display': true,
                'labelString': 'Overall bits'
              }
            }]
          },
          elements: {
            line: {
              tension: 0 // disables bezier curves
            }
          },
          tooltips: {
            callbacks: {
              beforeTitle(tooltipItem) {
                return tooltipItem.label;
              },
              title(tooltipItem) {
                return moment(tooltipItem.x).format('MMM D, h:mmA');
              }
            }
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
          <Navbar.Text>{lastUpdateTime ? `Last update time: ${moment(lastUpdateTime).format('MMM D, h:mmA')}` : ''}</Navbar.Text>
          <Nav pullRight>
            <NavItem href="https://github.com/dkwingsmt/hgc-bits-tracker" pullRight>Github</NavItem>
          </Nav>
        </Navbar>
        <div style={{ maxWidth: 800, margin: 'auto' }}>
          <canvas id="myChart" width={800} height={600} />
        </div>
      </div>
    );
  }
}

export default App;
