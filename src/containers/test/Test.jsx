import styles from './test.less';
import React, { Component } from 'react';

// import Chart from 'roc-charts';
import Chart from '../../chart';

import icon1 from '@images/node/head1.svg';
import icon2 from '@images/node/head2.svg';
import icon3 from '@images/node/head3.svg';
import icon4 from '@images/node/head4.svg';
import icon5 from '@images/node/head5.svg';
import watermark from '@images/watermark.png';

import data from './graph.js';
import address from './address.js';

import { getInfo } from '../../common/etherscan.js';
import { add } from 'lodash';
import { ethers } from 'ethers';
function randomString(len) {
    len = len || parseInt(Math.random() * 5, 10) + 2;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = chars.length;
    var pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

let count = 0;

Chart.changeConfig({
    link: {
        // color: 'red'
    }
});

export default class Test extends Component {
    chart1;
    chart2;
    nodes;
    id;
    addressMap;

    constructor() {
        super();
        this.state = {
            startAddress: '0x03e75d7DD38CCE2e20FfEE35EC914C57780A8e29',
            type: 'erc20',
        }
    }

    clickButton() {
        const startAddress = this.state.startAddress;
        this.nodes = {
            links: [],
            nodes: [],
        }
        var that = this;
        getInfo(startAddress, this.state.type).then((data) => {
            that.insertNodes(data)
            const res = that.getNodesLinks(JSON.parse(JSON.stringify(that.nodes)));
            console.log(res)
            that.drawChart('chart1', res);
        })
    }

    changeType(e) {
        this.setState({
            type: e.target.value,
        })
        console.log(this.state.type)

    }
    
    changeAddress(e) {
        this.setState({
            startAddress: e.target.value,
        })
    }

    findIdByAddress(address) {
        if (this.addressMap[address]) {
            return this.addressMap[address]
        }
        this.id++;
        this.addressMap[address] = this.id;
        var name = address;
        console.log(name, '==', this.state.startAddress)
        if (name.toLowerCase() === this.state.startAddress.toLowerCase()) {
            name = '初始地址'
        }
        this.nodes.nodes.push({
            'degree': 0,
            'id': this.addressMap[address],
            'name': name,
            'person': true,
        })
        return this.addressMap[address]
    }

    insertNodes(nodes) {
        // 先查找from和to的address Id
        for (const key in nodes) {
            var element = nodes[key];
            const from = element.from ? element.from : element.contractAddress
            const to = element.to ? element.to : element.contractAddress
            const fromId = this.findIdByAddress(from)
            const toId = this.findIdByAddress(to)
            var money = element.value
            if (this.state.type === 'erc20') money = ethers.utils.formatEther(element.value)
            console.log('money', money)
            this.nodes.links.push({
                'dashed': false,
                'from': fromId,
                'relation': money,
                'to': toId,
            })
        }
    }

    componentDidMount() {
        this.addressMap = {}
        this.id = 0
        this.nodes = {
            links: [],
            nodes: [],
        }

        const startAddress = '0x03e75d7DD38CCE2e20FfEE35EC914C57780A8e29'
        var that = this;
        getInfo(startAddress, this.state.type).then((data) => {
            console.log(data)
            that.insertNodes(data)
            const res = that.getNodesLinks(JSON.parse(JSON.stringify(that.nodes)));
            console.log(res)
            that.drawChart('chart1', res);
        })
       
    }

    getNodesLinks(data) {
        let nodes = data.nodes;
        let links = data.links;

        nodes.forEach((node) => {
            const image = [icon1, icon2, icon3, icon4, icon5];

            node.style = {
                ...node.style,
                image: image[node.id % 5],
                size: node.important ? 'large' : ''
            };

            if (node.id % 4 === 0) {
                node.subImage = {
                    // hide: true,
                    // r: 10,
                    images: [
                        {
                            image: icon4,
                        },
                        {
                            image: icon2,
                            hide: Math.random() > .5
                        },
                        {
                            image: icon3,
                        },
                    ]
                };
            }

            count++;
        });

        links.forEach((link) => {
            if (link.dashed) {
                link.style = {};
                link.style.dashed = true;
            }
            link.text = link.relation;
        });

        return { nodes, links };
    }

    drawChart(id, data, large) {
        if (large) {
            this.chart2 = new Chart({
                id,
                type: 'annular',
                data,
            });
            this.chart2.init({
                core: {
                    animation: false,
                    // watermark: {
                    //     image: watermark,
                    //     width: 300,
                    //     height: 300,
                    // },
                    // initPlugin: false
                },
                chart: {
                    // 传递给图谱的配置
                    force: {
                        // 对力导向图进行独立配置
                    }
                },
                plugin: {
                    common: {
                        disable: ['changeNodeDrag', 'nodeInfo', 'changeLineWidth'],
                    },
                    changeChart: {
                        charts: ['force', 'annular'],
                    },
                }
            });
        } else {
            this.chart1 = new Chart({
                id,
                type: 'force',
                data,
            });
            this.chart1.init({
               
                core: {
                    text: {
                        fontSize: 20,
                    },
                    animation: false,
                    // watermark: {
                    //     image: watermark,
                    //     width: 300,
                    //     height: 300,
                    // },
                    initPlugin: true
                },
                plugin: {
                    rightKey: {
                        keys: [
                            {
                                name: '隐藏节点',
                                click: (params) => {
                                    const node = params.target.source;
                                    this.chart1.util.hideNodes([node.id]);
                                },
                                isShow(params) {
                                    if (params.isNode) {
                                        return true;
                                    }
                                }
                            },
                            {
                                name: '删除节点',
                                click: (params) => {
                                    const node = params.target.source;
                                    this.chart1.util.deleteNodes([node.id]);
                                },
                                isShow(params) {
                                    if (params.isNode) {
                                        return true;
                                    }
                                }
                            },
                            {
                                name: '复位',
                                click(params) {
                                    // params.$chart.reset();
                                    // 调用插件的方法，被调用的插件必须被实例化
                                    params.plugins.reset.onClick();
                                },
                            },
                        ]
                    },
                    changeChart: {
                        charts: ['force', 'annular'],
                    },
                    nodeInfo: {
                        async getNodeInfo(node) {
                            return await new Promise((resolve, reject) => {
                                console.log(node)
                                resolve('地址标签：xx交易所')
                            });
                        }
                    }
                }
            });

            // 点击绑定
            this.chart1.addEventListener('click', (target) => {
                // 通过 target.source 获取到点击的元素
                if (target.hasOwnProperty('source') === false) return;
                const source = target.source;
                
                if (source) {
                    // 通过 category 判断元素类型
                    if (source.category === 'node') {
                        // 点击元素为节点，source 为这个节点对象
                        console.log('node', source);
                        var that = this;
                        getInfo(source.name, this.state.type).then((data) => {
                            if (data.length === 0) return;
                            that.insertNodes(data)
                            const res = that.getNodesLinks(JSON.parse(JSON.stringify(that.nodes)));
                            // console.log(res.nodes)
                            // console.log(res.links)
                            // that.chart1.extend(source.id, res.nodes, res.links)
                            // console.log(res)
                            that.drawChart('chart1', res);
                            // that.chart1.refresh()
                        })
                    } else if (source.category === 'link') {
                        // 点击元素为线，source 为这条线对象
                        console.log('link', source);
                    }
                } else {
                    // source 为 undefined 则点击的空白处
                }
            });
        }
    }

    showBigChart = () => {
        const res = this.getNodesLinks(JSON.parse(JSON.stringify(data[1])));
        this.drawChart('chart2', res, true);
    };

    render() {
        return (
            <div className={styles.container}>
                <div className="container">
                    <p className={styles.title}>ETH/TRX交易图谱</p>
                    <p className={styles.info}>
                        <select id="type" 
                        onChange={this.changeType.bind(this)} 
                        // onChange={e => {console.log(this.state.type); this.setState({ type: e.target.value || null })}}
                        value={this.state.type} className={styles.select}>
                            <option key="etc20" value="erc20">ERC20</option>
                            <option key="trc20" value="trc20">TRC20</option>
                        </select>
                        <input className={styles.input} 
                        value={this.state.startAddress}
                        onChange={this.changeAddress.bind(this)}
                        ></input>
                        <button className={styles.button} onClick={this.clickButton.bind(this)}>查询</button>
                    </p>
                    
                    <br />
                    <hr />
                    <div className={styles.result}>
                        <div id="chart1" className={styles.chart}>
                            <p className={styles.noData}>暂无数据</p>
                        </div>
                        <br />
                        <br />
                        {/* <span className={styles.btn} onClick={this.showBigChart}>展示超大节点图</span>
                        <div id="chart2" className={styles.chart} >
                            <p className={styles.noData} > 暂无数据 </p>
                        </div > */}
                    </div>
                </div>
            </div >
        );
    }
}
