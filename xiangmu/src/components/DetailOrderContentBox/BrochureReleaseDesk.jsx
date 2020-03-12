
//标准组件环境  退费情况
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { loadBizDictionary, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { timestampToTime } from '@/utils';
 
import ContentBox from '@/components/ContentBox'; 

import { OrderBrochureList } from '@/actions/recruit';

class OrderRefundInfo extends React.Component {
    constructor() {
        super()
        this.state = {
            face:[],
            youbo:[],
            online:[]
        }
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this); 
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        (this: any).fetchOrderFeeById = this.fetchOrderFeeById.bind(this);

        this.state = {
            dataModel: {},
            loading: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        this.fetchOrderFeeById();
    }
    componentWillUnMount() {
    }
    fetchOrderFeeById(){
      if(this.props.orderId){
        this.props.OrderBrochureList({studentId:this.props.studentId,orderId:this.props.orderId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                console.log(data) 
              this.setState({
                dataModel: data.data, 
                face:data.data[0].face,
                youbo:data.data[1].youbo,
                online:data.data[2].online,
              });
            }
            else {
                message.error(data.message);
            }
        })
      }
    }

    renderContent = (value, row, index) => {
        if(index < this.state.refund_list.length - 1){
            return value;
        }
        return {
          children: '', props: { colSpan: 1}
        }
    };

    columns_face = [
        {
            title: '资料名称',
            dataIndex: 'materialName', 
        }, {
            title: '打包资料',
            dataIndex: 'isPack', 
        },
        {
          title: '资料类型',
          dataIndex: 'materialType', 
        },
        {
            title: '主要商品',
            dataIndex: 'productName', 
        },
        {
          title: '讲师',
          dataIndex: 'techer', 
        },
        {
            title: '领取方式',
            dataIndex: 'receiveWay', 
        },
        {
            title: '领取人',
            dataIndex: 'receiver', 
        },
        {
            title: '领取日期',
            dataIndex: 'receiveDate', 
            render:(text,record)=>{
                return timestampToTime(record.receiveDate)
            }
        },
        {
            title: '快递公司',
            dataIndex: 'express', 
        },
        {
            title: '快递编号',
            dataIndex: 'expressNum', 
        },
    ]

    columns_youbo = [
        {
            title: '资料名称',
            dataIndex: 'materialName', 
        }, {
            title: '打包资料',
            dataIndex: 'isPack', 
        },
        {
          title: '资料类型',
          dataIndex: 'materialType', 
        },
        {
            title: '课程名称',
            dataIndex: 'courseName', 
        },
        {
          title: '讲师',
          dataIndex: 'techer', 
        }, 
        {
            title: '领取日期',
            dataIndex: 'receiveDate', 
            render:(text,record)=>{
                return timestampToTime(record.receiveDate)
            }
        },
        {
            title: '快递名称',
            dataIndex: 'express', 
        },
        {
            title: '快递编号',
            dataIndex: 'expressNum', 
        },
        {
            title: '收件人',
            dataIndex: 'receiver', 
        },
    ]

    columns_online = [
        {
            title: '课程名称',
            dataIndex: 'courseName', 
        }, {
            title: '所属商品名称',
            dataIndex: 'productName', 
        },
        {
          title: '是否赠送',
          dataIndex: 'isGive', 
        },
        {
            title: '是否允许重修',
            dataIndex: 'isRehear', 
        },
        {
          title: '激活状态',
          dataIndex: 'activeState', 
        },
        {
            title: '激活时间',
            dataIndex: 'activeTime', 
        },
        {
            title: '领取情况',
            dataIndex: 'receiveWay', 
        },
    ]

    //渲染，根据模式不同控制不同输出
    render() { 

        let block_content_refund = <ContentBox titleName='学生资料领取情况' >
            <div className="dv_split"></div>
            <div className="search-result-list">
            <p style={{fontSize:14,marginBottom:20}}>面授资料领取情况:</p>
                <Table columns={this.columns_face} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.face}//数据
                    bordered

                />
            </div>
            <div className="dv_split"></div> 
            <div className="search-result-list">
            <p style={{fontSize:14,marginBottom:20}}>优播网课资料领取情况:</p>
                <Table columns={this.columns_youbo} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.youbo}//数据
                    bordered

                />
            </div>
            <div className="dv_split"></div>
            <div className="search-result-list">
            <p style={{fontSize:14,marginBottom:20}}>网课讲义领取情况:</p>
                <Table columns={this.columns_online} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.online}//数据
                    bordered
                />
            </div>
            <div className="dv_split"></div>
        </ContentBox>


        let block_content = <div>
            {block_content_refund}
        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedOrderPayInfor = Form.create()(OrderRefundInfo);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        OrderBrochureList: bindActionCreators(OrderBrochureList, dispatch)
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderPayInfor);
