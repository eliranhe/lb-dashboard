import React, { Component } from 'react';
import _ from 'lodash';
import ReactHighcharts from 'react-highcharts';
import { ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap';
import './App.css';

const colors = ['#0000AA', '#0066AA', '#00CCAA', '#00AAAA'];

const getRpsAverage = rpsArray => _.round(_(rpsArray).map(1).mean(), 2);

function getGraphConfig(instanceGroups, instanceGroupToColor, title) {
    const series = _.map(
        instanceGroups,
        (g, i) => ({ type: 'area', name: g.instanceGroupName, data: g.rps, color: instanceGroupToColor[g.instanceGroupName] }));

    return {
        chart: {
            zoomType: 'x',
            width: 1200
        },
        title: {
            text: title
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'RPS'
            }
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            area: {
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series
    }
}

const InstanceGroup = ({instanceGroupName, availabilityZone, instances, cpu, rps, color}) => {
    const tooltip = (
        <Tooltip id="tooltip">
            <div>
                <strong>{cpu.avg}%</strong> (Max = {cpu.max}%)
            </div>
            <div>
                <strong>Capacity is drained to 90%</strong>
            </div>
        </Tooltip>
    );
    return (
        <div className="instance-group">
            <span className="instance-group-color" style={{ backgroundColor:color }}></span>
            <div>
                <div><strong>{instanceGroupName}</strong></div>
                <div>{availabilityZone}</div>
            </div>
            { instances.total ?
                <div>
                    {instances.healthy} of {instances.total} instance{instances.healthy > 1 ? 's' : ''} healthy
                </div> :
                <div>No instance configured. <a>Edit</a></div>}
            { instances.total ?
                <span className="instance-group-problem"/> :
                <img className="instance-group-problem" src="/exclamation.png" alt="Oh no!"/> }
            <div>
                <div><strong>CPU Utilization: </strong>{cpu.avg}%</div>
                { instances.total ? <div><strong>Rate: </strong>{getRpsAverage(rps)}</div> : null }
            </div>
            <div>
                <OverlayTrigger placement="bottom" overlay={tooltip}>
                    <ProgressBar now={cpu.avg}/>
                </OverlayTrigger>
            </div>
        </div>);
};


const Region = ({regionName, instanceGroups, metric, instanceGroupToColor}) => {
    const totalRegionRps = _(instanceGroups).map(g => getRpsAverage(g[metric])).compact().sum();
    return (
        <div className="region">
            <div className="region-details">
                <div>
                    {regionName}
                </div>
                <div>
                    {totalRegionRps} RPS
                </div>
            </div>
            <div className="instance-groups">
                {_.map(
                    instanceGroups,
                    g => <InstanceGroup key={g.instanceGroupName} {...g} color={instanceGroupToColor[g.instanceGroupName]}/>)}
            </div>
        </div>);
};


class App extends Component {
    render() {
        const lb = this.props.loadBalancers[0];

        const service = lb.services[0];
        const instanceGroups = service.instanceGroups;

        const instanceGroupToColor = _.zipObject(_.map(instanceGroups, 'instanceGroupName'), colors);

        const title = `RPS for ${service.serviceName} by Instance Group`;
        const config = getGraphConfig(instanceGroups, instanceGroupToColor, title);

        const instanceGroupsByRegion = _.groupBy(instanceGroups, 'region');

        return (
            <div className="App">
                <ReactHighcharts config={config}/>
                <div className="status">
                    <div className="header">
                        <div className="region-header">Frontend Location</div>
                        <div className="instance-groups-header">Backend</div>
                    </div>
                    {_.map(
                        instanceGroupsByRegion,
                        (instanceGroups, regionName) => <Region regionName={regionName}
                                                                key={regionName}
                                                                instanceGroups={instanceGroups}
                                                                metric="rps"
                                                                instanceGroupToColor={instanceGroupToColor}/>)}
                </div>
            </div>
        );
    }
}

export default App;
