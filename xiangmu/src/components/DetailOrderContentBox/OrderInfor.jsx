//标准组件环境  订单信息(方向班)
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
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml, formatMoney } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import TopUserName from './TopUserName'


class OrderInfor extends React.Component {
    constructor(props) {
        super(props)
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);


        this.state = {
            currentDataModel: props.orderInfo || {},
            loading: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status']);
        this.state.currentDataModel.orderProductList.push({});
    }
    componentWillUnMount() {
    }

    componentWillReceiveProps(nextProps) {
      if('orderInfo' in nextProps){
        var _orderInfo = nextProps.orderInfo || {};
        if(_orderInfo.orderProductList){
          _orderInfo.orderProductList.push({});
        }
        this.setState({
          currentDataModel: nextProps.orderInfo
        })
      }
    }

    renderContent = (value, row, index) => {
        const obj = {
            children: value,
            props: {},
        };
        if (index === this.state.currentDataModel.orderProductList.length - 1) {
            obj.props.colSpan = 0;
        }
        return obj;
    }

    renderTd = (val, row, index) => {
        var amount = 0;
        if (index < this.state.currentDataModel.orderProductList.length - 1) {
            return <span>{formatMoney(row[val])}</span>
        }else{
            this.state.currentDataModel.orderProductList.map(item => {
                amount += parseFloat(item[val] || 0);
            })
        }
        return <span>{formatMoney(amount)}</span>
    }

    columns_product = [
        {
            title: '商品名称',
            dataIndex: 'productName',
            render: (text, record, index) => {
                if (index < this.state.currentDataModel.orderProductList.length - 1) {
                    return <span>{record.productName}</span>
                }
                return {
                    children: <span>费用合计：</span>,
                    props: {
                        colSpan: 3,
                    },
                }
            }
        },
        {
            title: '班型',
            dataIndex: 'classTypeName',
            render: this.renderContent,
        },
        {
            title: '合作方式',
            render: (value, record, index) => {
                return this.renderContent('方向班',record, index);
                
                // if (index < this.state.currentDataModel.orderProductList.length - 1) {
                     
                // }
                // if (index === this.state.currentDataModel.orderProductList.length - 1) {
                //     return {
                //         children: <span className='fontBold'>费用合计 ：</span>,
                //         props: {},
                //     };
                // }
            }
        },
        {
            title: '标准金额（¥）',
            dataIndex: 'initialPrice',
            render: (value, record, index) => {
               if (index < this.state.currentDataModel.orderProductList.length - 1) {
                    return formatMoney(record.initialPrice);
               }
                return {
                    children: <span>{this.renderTd('initialPrice', record, index)}</span>,
                    props: {
                        colSpan: 2,
                    },
                }
            }
        },
        {
            title: '分期',
            dataIndex: 'term',
            render: this.renderContent,
        },
        {
            title: '当期金额（¥）',
            dataIndex: 'productFirstTermPrice',
            render: (value, record, index) => {
                return this.renderTd('productFirstTermPrice', record, index)
            }
        },
    ]
    columns_discount = [
        {
            title: '优惠名称',
            dataIndex: 'productDiscountName',
        },
        {
            title: '优惠类型',
            dataIndex: 'productDiscountTypeStr',
        },
        {
            title: '优惠金额',
            dataIndex: 'discountAmount',
        },
    ]

    columns_fee = [
        {
            title: '分期',
            width: 100,
            dataIndex: 'term',
        }, {
            title: '分期缴费金额',
            width: 130,
            dataIndex: 'payableAmount',
            render: (value, record, index) => {
                return formatMoney(record.payableAmount)
            }
        },
        {
            title: '缴费日期',
            width: 100,
            dataIndex: 'payableDate',
            render: text => <span>{timestampToTime(text)}</span>
        },
        {
            title: '开通科目',
            dataIndex: '',
            render: (text, record) => {
              var _s = "";
              (record.orderInstalmentCategoryList || []).map(i => {
                _s += i.courseCategoryName + "、"
              })

              return _s ? _s.substr(0, _s.length - 1) : _s
            }
        },
    ]

    //渲染，根据模式不同控制不同输出
    render() {
        const { getFieldDecorator } = this.props.form;
        var d = this.state.currentDataModel;
        let block_content_1 =
            <ContentBox titleName='订单基本信息部分' hideBottomBorder={true}>
                <Form className="search-form">
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="订单类型"
                            >
                            {d.orderType == 1 ? '个人订单' : d.partnerClassType == 1 ? '大客户方向班' : '大客户精英班'}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="订单状态"
                            >
                            {d.orderStatusStr}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="主体"
                            >
                            {d.zbPayeeTypeStr}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="订单归属"
                            >
                                {d.regionName} {d.branchName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="市场人员"
                            >
                              {d.benefitMarketUserName}
                              </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label='电咨人员'
                            >
                              {d.benefitPconsultUserName}
                    </FormItem>
                        </Col>

                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="面咨人员"
                            >
                              {d.benefitFconsultUserName}
                            </FormItem>
                        </Col>

                        <Col span={12} >
                            <FormItem
                                {...searchFormItemLayout}
                                label="创建人"
                            >
                              {d.createName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="创建日期"
                            >
                              {d.createDateStr}
                           </FormItem>
                        </Col>
                        {   //非个人订单显示大客户
                            d.orderType != 1 && <Col span={12}>
                                                    <FormItem
                                                            {...searchFormItemLayout}
                                                            label="大客户"
                                                        >
                                                        {d.orgName}
                                                    </FormItem>
                                                </Col>
                        }
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="教学点"
                            >
                              {d.teachCenterName}
                           </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout24}
                                label="学生常驻城市"
                            >
                              {d.areaName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="老学生姓名"
                            >
                              {d.recommendStudentName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="老学生手机"
                            >
                              {d.recommendStudentPhone}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="代理姓名"
                            >
                              {d.agentName}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="代理手机"
                            >
                              {d.agentPhone}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="备注"
                            >
                              {d.applyReason}
                           </FormItem>
                        </Col>
                        {
                            d.remarkFilePath && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="备注附件"
                                >
                                <a href={d.remarkFilePath} target='_Blank'>点我查看</a>
                               </FormItem>
                            </Col>
                        }
                    </Row>
                </Form>
            </ContentBox>

        let block_content_2 =
            <ContentBox titleName='订单商品设置部分' hideBottomBorder={true}>
                <div className="dv_split"></div>
                <div className="search-result-list">
                    <Table columns={this.columns_product} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        //dataSource={this.state.data_1}//数据
                        dataSource={d.orderProductList}//数据
                        bordered
                    /></div>
                <div className="dv_split"></div>
            </ContentBox>
        let block_content_3 = <ContentBox titleName='订单优惠设置部分' hideBottomBorder={true}>
            <div className="dv_split"></div>
            <div className="search-result-list">
                <Table columns={this.columns_discount} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    //dataSource={this.state.data_2}//数据
                    dataSource={d.orderDiscountList}//数据
                    bordered
                /></div>
            <div className="dv_split"></div>
        </ContentBox>
        let block_content_4 = <ContentBox titleName='订单分期部分' >
            <div className="dv_split"></div>
            <div className="search-result-list">
                <Table columns={this.columns_fee} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    //dataSource={this.state.data_3}//数据
                    dataSource={d.orderInstalmentList}//数据
                    bordered
                    footer={() => <Row justify='center' type='flex'><span className='font-large'>当前应缴费用（¥） ：{formatMoney(this.state.currentDataModel.currentPayableAmount)}    收费方：{this.state.currentDataModel.payeeTypeStr} </span></Row>}
                /></div>
            <div className="dv_split"></div>
        </ContentBox>

        let block_content_0 = <TopUserName data={this.state.currentDataModel}/>
        let block_content = <div>
            {block_content_0}
            {block_content_1}
            {block_content_2}
            {/*block_content_3*/}
            {block_content_4}
        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedOrderInfor = Form.create()(OrderInfor);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderInfor);
