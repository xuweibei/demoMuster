//标准组件环境  订单信息(非方向班)
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
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch,
  onPageIndexChange, onShowSizeChange, onToggleSearchOption,
  renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml,
  formatMoney } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import TopUserName from './TopUserName'
import { queryMaxDiscountQuotaByItems } from '@/actions/recruit';
import ProductView from '@/components/ProductPriceDetail/view'
import DiscountView from '@/components/DiscountViewDetail/view'

class OrderInforDesc extends React.Component {
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
        (this: any).onHideModal = this.onHideModal.bind(this);
        this.state = {
            currentDataModel: props.orderInfo || {},
            loading: false,
            staff_limit: 0,
            isShowProductDetail: false,
            isShowDiscountRateAmount: false,
            productPriceIds: []
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'discount_type', 'payee_type']);
        
    }
    componentWillUnMount() {
    }
    getMaxDiscountRulePrice = (_orderInfo) => {
        if(_orderInfo.itemIds){
            var itemIds = _orderInfo.itemIds;
            this.props.queryMaxDiscountQuotaByItems(itemIds).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.state === 'success') {
                this.setState({
                    staff_limit: parseFloat(data.data.discountPrice || 0)
                });
                }
                else {
                    message.error(data.message);
                }
            })
        }
        
    }
    componentWillReceiveProps(nextProps) {
      if('orderInfo' in nextProps){
        var _orderInfo = nextProps.orderInfo || {};
        if(_orderInfo.orderProductList){
          _orderInfo.product_list = [];
          _orderInfo.orderProductList.map(p => {
            p.discount = {
              productDiscountPrice: p.productDiscountPrice,
              productDiscountId: p.productDiscountId
            }
            _orderInfo.product_list.push(p);
          })
          _orderInfo.product_list.push({});
        }
        var _fee_list = [{
          totalInitialAmount: _orderInfo.totalInitialAmount,
          totalProductDiscountAmount: _orderInfo.totalProductDiscountAmount,
          totalOrderDiscountAmount: _orderInfo.totalOrderDiscountAmount,
          totalAmount: _orderInfo.totalAmount
        }];
        _orderInfo.fee_list = _fee_list;
        if(_orderInfo.orderInstalmentList){
          _orderInfo.orderInstalmentList.map(i => {
            i.courseCategoryNames = [];
            i.orderInstalmentCategoryList.map(j => {
              i.courseCategoryNames.push(j.courseCategoryName);
            })
          })
          _orderInfo.term_list = _orderInfo.orderInstalmentList;
        }
        if(_orderInfo.orderDiscountList){
          var _discount_list = [{},{}];
          _orderInfo.orderDiscountList.map(d => {
              if(d.productDiscountType == 7){
                  d.productDiscountPrice = d.discountAmount;
              }
            // if(d.productDiscountType == 2){
              _discount_list.splice(0, 0, d);
            // }
          })
          _orderInfo.discount_list = _discount_list;
        }
        this.setState({
          currentDataModel: _orderInfo
        })

        this.getMaxDiscountRulePrice(_orderInfo);
      }
    }
    onHideModal() {
        this.setState({
          isShowProductDetail: false,
          isShowDiscountRateAmount: false
        })
      }

    setProductPriceIds = () => {
        var productPriceIds = [];
        
        if(this.state.currentDataModel.product_list.length){
            this.state.currentDataModel.product_list.map(item => {
                productPriceIds.push(item.productPriceId);
            })
        }
        return productPriceIds.join(',');
    }

      
    renderContent = (value, row, index) => {
        const obj = {
            children: value,
            props: {},
        };
        if (index === this.state.currentDataModel.product_list.length - 1) {
            obj.props.colSpan = 0;
        }
        return obj;
    };
    renderContent_2 = (value, row, index) => {
        const obj = {
            children: value,
            props: {},
        };
        if (index >= this.state.currentDataModel.discount_list.length - 2) {
            obj.props.colSpan = 0;
        }
        return obj;
    };
    columns_product = [
        {
            title: '商品名称',
            dataIndex: 'productName',
            render: this.renderContent,
        },
        {
            title: '班型',
            dataIndex: 'classTypeName',
            render: this.renderContent,
        },
        {
            title: '价格来源',
            dataIndex: 'priceSourceStr',
            render: (value, record, index) => {
                const obj = {
                    children: <Row justify='end' type='flex'><span className='fontBold' style={{ marginRight: 10, }}>费用合计 ：</span></Row>,
                    props: { colSpan: 3 },
                };
                if (index < this.state.currentDataModel.product_list.length - 1) {
                    return value;
                }
                if (index === this.state.currentDataModel.product_list.length - 1) {
                    return obj;
                }
            },
        },
        {
            title: '标准金额（¥）',
            dataIndex: 'initialPrice',
            render: (value, record, index) => {
                if (index < this.state.currentDataModel.product_list.length - 1) {
                    return value;
                }
                if (index === this.state.currentDataModel.product_list.length - 1) {
                  var amount = 0;
                  this.state.currentDataModel.product_list.map(item => {
                    amount += parseFloat(item.initialPrice || 0);
                  })
                  const obj = {
                      children: <Row justify='start' type='flex'><span className='fontBold' style={{ marginLeft: 10 }}>{formatMoney(amount)}</span></Row>,
                      props: { colSpan: 2 },
                  };
                    return obj;
                }
            },
        },
        {
            title: '  折扣（¥）',
            //dataIndex: 'discount.productDiscountPrice',
            dataIndex: 'productDiscountPrice',
            render: (value, record, index) => {
              if(index < this.state.currentDataModel.product_list.length - 1){
                return <span>{record.discount.productDiscountPrice || 100}%</span>
              }
              return {
                children: {},
                props: { colSpan: 0 },
              };
            }
        },
        {
            title: '折扣优惠金额（¥）',
            dataIndex: 'discountRateAmount',
            render: (value, record, index) => {
                if (index < this.state.currentDataModel.product_list.length - 1) {
                    return <div><a onClick={() => { 
                        this.setState({discountRateAmount:record});
                        setTimeout(()=>{
                            this.setState({isShowDiscountRateAmount:true});
                        },300)
                        }}>{formatMoney(value)}</a></div>;
                }
                var amount = 0;
                this.state.currentDataModel.product_list.map(item => {
                  amount += parseFloat(item.discountRateAmount || 0);
                })
                return <span className='fontBold'>{formatMoney(amount)}</span>
            },
        },
        {
            title: '实际金额（¥）',
            dataIndex: 'productRateAmount',
            render: (value, record, index) => {
                if (index < this.state.currentDataModel.product_list.length - 1) {
                    return value;
                }
                var amount = 0;
                this.state.currentDataModel.product_list.map(item => {
                  amount += parseFloat(item.productRateAmount || 0);
                })
                return <span className='fontBold'>{formatMoney(amount)}</span>
            },
        },
    ]
    columns_discount = [
        {
            title: '优惠名称',
            dataIndex: 'productDiscountName',
            render: (value, record, index) => {
                if (index < this.state.currentDataModel.discount_list.length - 2) {
                  return value;
                }
                if(index == this.state.currentDataModel.discount_list.length - 2){
                  const obj = {
                    children: <Row justify='end' type='flex'><span style={{ marginRight: 10, }}>员工特殊优惠：</span></Row>,
                    props: { colSpan: 2 },
                  };
                  return obj;
                }
                if (index >= this.state.currentDataModel.discount_list.length - 2) {
                  const obj = {
                    children: <Row justify='end' type='flex'><span className='fontBold' style={{ marginRight: 10, }}>优惠金额（¥）：</span></Row>,
                    props: { colSpan: 2 },
                  };
                  return obj;
                }
            },
        }, {
            title: '优惠类型',
            dataIndex: 'productDiscountType',
            //render: this.renderContent_2,
            render: (value, record, index) => {
              if(index < this.state.currentDataModel.discount_list.length - 2){
                return <span>{getDictionaryTitle(this.state.discount_type, value)}</span>
              }else {
                return {
                  children: <span></span>,
                  props: { colSpan: 0 }
                }
              }
            }
        },
        {
            title: '优惠金额',
            dataIndex: 'productDiscountPrice',
            render: (value, record, index) => {
              if(index < this.state.currentDataModel.discount_list.length - 2){
                return <span>{formatMoney(value)}</span>
              }
              if(index == this.state.currentDataModel.discount_list.length - 2){
                return {
                  children: <div>
                      <span>{this.state.currentDataModel.stafflDiscountAmount}</span>
                      <span>【最高限额{this.state.staff_limit}元】</span>
                    </div>,
                  props: { colSpan: 1 }
                }
              }else {
                var _money = 0;
                this.state.currentDataModel.discount_list.map(d => {
                  _money += parseFloat(d.productDiscountPrice || 0);
                })
                return {
                  children: <span className='fontBold'>{formatMoney(_money + parseFloat(this.state.currentDataModel.stafflDiscountAmount || 0))}</span>,
                  props: { colSpan: 1 }
                }
              }
            }

        },
    ]
    columns_fee = [
        {
            title: '订单标准金额（¥）',
            dataIndex: 'totalInitialAmount',
            render: text => <span>{formatMoney(text)}</span>
        }, {
            title: '折扣优惠金额（¥）',
            dataIndex: 'totalProductDiscountAmount',
            render: text => <span>{formatMoney(text)}</span>
        },
        {
            title: '现金优惠金额（¥）',
            dataIndex: 'totalOrderDiscountAmount',
            render: text => <span>{formatMoney(text)}</span>
        },
        {
            title: '实际应缴金额（¥）',
            dataIndex: 'totalAmount',
            //render: text => <span>{formatMoney(text)}</span>
            render: (value, record, index) => {
                return <div><a onClick={() => { 
                this.setState({productDetail:record});
                setTimeout(()=>{
                    this.setState({isShowProductDetail:true});
                },300)
                }}>{formatMoney(value)}</a></div>
            }
        },
    ]

    columns_term = [
        {
            title: '分期',
            width: 100,
            dataIndex: 'term',
            render: text => <span>第{text}期</span>
        }, {
            title: '分期缴费金额',
            width: 130,
            dataIndex: 'payableAmount',
            render: (text, record, index) => {
              return <span>{formatMoney(text)}</span>
              if(index == this.state.currentDataModel.term_list.length - 1){
                return <span>{formatMoney(text)}</span>
              }
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
            //dataIndex: 'courseCategoryNames',
            render: (text, record) => {
              return <span>{record.courseCategoryNames.join('、')}</span>
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
                                label="订单来源"
                            >
                            {d.orderSourceStr}
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
                        {  //非个人订单显示大客户
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
                        dataSource={d.product_list}//数据
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
                    dataSource={d.discount_list}//数据
                    bordered
                /></div>
            <div className="dv_split"></div>
        </ContentBox>

        let block_content_4 = <ContentBox titleName='订单费用汇总' hideBottomBorder={true}>
            <div className="dv_split"></div>
            <div className="search-result-list">
                <Table columns={this.columns_fee} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={d.fee_list}
                    bordered
                /></div>
            <div className="dv_split"></div>
            {
                this.state.isShowProductDetail &&
                    <Modal
                    title="商品详细信息"
                    visible={this.state.isShowProductDetail}
                    //onOk={this.onChangeDate}
                    onCancel={this.onHideModal}
                    //okText="确认"
                    //cancelText="取消"
                    footer={null}
                    width={1000}
                    >
                    <ProductView
                        viewCallback={this.onHideModal}
                        editMode={'View'}
                        productPriceIds={this.setProductPriceIds()}
                        currentDataModel={this.state.productDetail} />
                    </Modal>
            }
            {
                this.state.isShowDiscountRateAmount &&
                    <Modal
                    title="折扣优惠详细信息"
                    visible={this.state.isShowDiscountRateAmount}
                    //onOk={this.onChangeDate}
                    onCancel={this.onHideModal}
                    //okText="确认"
                    //cancelText="取消"
                    footer={null}
                    width={1000}
                    >
                    <DiscountView
                        viewCallback={this.onHideModal}
                        editMode={'View'}
                        orderProductDiscountList={this.state.currentDataModel.orderProductDiscountList}
                        currentDataModel={this.state.discountRateAmount} />
                    </Modal>
            }
        </ContentBox>

        let block_content_5 = <ContentBox titleName='订单分期部分' >
            <div className="dv_split"></div>
            <div className="search-result-list">
                <Table columns={this.columns_term} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={d.term_list}//数据
                    bordered
                    footer={() =>
                      <Row justify='center' type='flex'>
                        <span className='font-large'>当前应缴费用（¥） ：{formatMoney(this.state.currentDataModel.currentPayableAmount)}    收费方：{this.state.currentDataModel.payeeTypeStr} </span>
                      </Row>}
                /></div>
            <div className="dv_split"></div>
        </ContentBox>

        

        let block_content_0 = <TopUserName data={d} />
        let block_content = <div>
            {block_content_0}
            {block_content_1}
            {block_content_2}
            {block_content_3}
            {block_content_4}
            {block_content_5}
        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedOrderInforDesc = Form.create()(OrderInforDesc);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        queryMaxDiscountQuotaByItems: bindActionCreators(queryMaxDiscountQuotaByItems, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedOrderInforDesc);
