//标准组件环境  需审核内容
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


const dateFormat = 'YYYY-MM-DD';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24,loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, convertTextToHtml, formatMoney } from '@/utils';

//业务接口方法引入
import { editBatchAdminUser, getBranchAdminUserList, editBranchAdminUserUniversities } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';

import { getOrderById, auditOrder, queryMaxDiscountQuotaByItems } from '@/actions/recruit';

class AuditContent extends React.Component {
    constructor() {
        super()
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.onToggleSearchOption = onToggleSearchOption.bind(this);
        this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
        this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
        this.onSearch = onSearch.bind(this);
        this.onPageIndexChange = onPageIndexChange.bind(this);
        this.onShowSizeChange = onShowSizeChange.bind(this);
        (this: any).getOrderDetail = this.getOrderDetail.bind(this);
        (this: any).onAudit = this.onAudit.bind(this);
        (this: any).getMaxDiscountQuota = this.getMaxDiscountQuota.bind(this);

        this.state = {
            currentDataModel: {
              orderInstalmentList: []
            },
            loading: false,
            staff_limit: 0,
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status', 'order_audit_status']);
        this.getOrderDetail();
    }
    componentWillUnMount() {
    }

    getOrderDetail(){
      var that = this;
      this.props.getOrderById(this.props.orderId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          this.setState({
            currentDataModel: data.data,
          })

          if(data.data.auditOrgTypeList && data.data.auditOrgTypeList.length == 0){
            this.props.onIsPass(true);
          }else{
            this.props.onIsPass(false);
          }

          that.getMaxDiscountQuota(data.data.itemIds);
        }
        else {
            this.setState({ loading: false })
            message.error(data.message);
        }
      })
    }

    getMaxDiscountQuota(itemIds){
      this.props.queryMaxDiscountQuotaByItems(itemIds).payload.promise.then((response) => {
          let data = response.payload.data;
          console.log(data.data)
          if (data.state === 'success') {
            this.setState({
              staff_limit: parseFloat(data.data.discountPrice || 0),
              first_discount_scale: parseFloat(data.data.firstDiscountScale || 0)
            });
          }
          else {
              message.error(data.message);
          }
      })
    }

    onAudit(){
      var that = this;
      this.props.form.validateFields((err, values) => {
        if(!err){
          that.setState({ loading: true });
          values.orderId = that.state.currentDataModel.orderId;
          that.props.auditOrder(values).payload.promise.then((response) => {
              let data = response.payload.data;
              that.setState({ loading: false });
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  message.success("订单审核成功");
                  //this.fetch();
                  that.props.viewCallback();
              }
          })
        }
      });
    }

    columns = [
        {
            title: '分期',
            dataIndex: 'term',
            render: text => <span>第{text}期</span>
        }, {
            title: '缴费金额',
            dataIndex: 'payableAmount',
            render: text => <span>{formatMoney(text)}</span>
        },
        {
            title: '缴费比例',
            dataIndex: 'payableProportion',
            render: text => <span>{text}%</span>
        },
        {
            title: '缴费日期',
            dataIndex: 'payableDate',
            render: text => <span>{timestampToTime(text)}</span>
        },
        {
            title: '开通科目',
            dataIndex: '',
            render: (text, record) => {
              var names = [];
              record.orderInstalmentCategoryList.map(c => {
                names.push(c.courseCategoryName);
              })
              return <span>{names.join('、')}</span>
            }
        },
    ]

    setAuditOrgType = (type) => {
      if(type == 1){
        return '待总部审核';
      }else if(type == 2){
        return '待大区审核';
      }else if(type == 3){
        return '待分部审核';
      }
    }

    //渲染，根据模式不同控制不同输出
    render() {
        console.log(this.state.currentDataModel)
        const { getFieldDecorator } = this.props.form;
        var d = this.state.currentDataModel;

        let block_content_0 =
            <ContentBox titleName='订单审核进度' hideBottomBorder={true}>
                <Form className="search-form">
                    <Row gutter={24}>
                      {
                        (d.auditOrgTypeList && d.auditOrgTypeList.length == 0) ?
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="订单审核状态"
                            >
                                审核通过
                           </FormItem>
                        </Col>
                        : ''
                      }
                      {
                        (d.auditOrgTypeList && d.auditOrgTypeList.length > 0) ?
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="当前审核状态"
                            >
                                {this.setAuditOrgType(d.auditOrgTypeList[0])}
                           </FormItem>
                        </Col>
                        : ''
                      }
                      {
                        (d.auditOrgTypeList && d.auditOrgTypeList.length > 1) ?
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="下一级审核状态"
                            >
                                {this.setAuditOrgType(d.auditOrgTypeList[1])}
                           </FormItem>
                        </Col>
                        : ''
                      }
                      {
                        (d.auditOrgTypeList && d.auditOrgTypeList.length > 2) ?
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="最终审核状态"
                            >
                                {this.setAuditOrgType(d.auditOrgTypeList[2])}
                           </FormItem>
                        </Col>
                        : ''
                      }
                    </Row>
                </Form>
            </ContentBox>

        let block_content_1 =
            <ContentBox titleName='学生特殊优惠申请' hideBottomBorder={true}>
                <Form className="search-form">
                    <Row gutter={24}>
                        <Col span={12}>
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
                                label="最高优惠限额（¥）"
                            >
                                {/*d.maxStafflDiscountAmount*/}
                                {/*this.props.orgType == 1 ? d.regionAmount :
                                  this.props.orgType == 2 ? d.supervisorAmount :
                                  d.employeeAmount*/}
                                {this.state.staff_limit}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="申请日期"
                            >
                              {d.createDateStr}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="特殊优惠金额（¥）"
                            >
                                {d.stafflDiscountAmount}
                           </FormItem>
                        </Col>
                    </Row>
                </Form>
            </ContentBox>

        let block_content_2 =
            <ContentBox titleName='学生分期付款审核' hideBottomBorder={true}>
                <Form className="search-form">
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="订单标准金额（¥）"
                            >
                              {formatMoney(d.totalInitialAmount)}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="优惠总金额（¥）"
                            >
                              {formatMoney(d.totalProductDiscountAmount + d.totalOrderDiscountAmount)}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="实际应缴金额（¥）"
                            >
                              {formatMoney(d.totalAmount)}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="总部要求首付款比例"
                            >
                                {this.state.first_discount_scale}%,首付金额：{formatMoney(d.totalAmount * this.state.first_discount_scale / 100)}（¥）
                           </FormItem>
                        </Col>
                    </Row>
                </Form>
                <div className="search-result-list">
                    <Table columns={this.columns} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.currentDataModel.orderInstalmentList}//数据
                        bordered
                        footer={() =>
                            <div>
                                <Row type='flex' justify='start'>
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml('备注信息：<br/> ' + (d.applyReason ? d.applyReason : '无')) }}></span>
                                </Row>
                                <div style={{height:20}}></div>
                                <Row type='flex' justify='start'>
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml('以下为审核情况：<br/> ' + (d.auditLog ? d.auditLog : '无')) }}></span>
                                </Row>
                            </div>
                          

                        }
                    />
                </div>
                <div className='dv_split'></div>

            </ContentBox>
        var auditTitle = this.props.orgType == 1 ? "总部审核" : this.props.orgType == 2 ? "大区审核" : "分部审核";
        let block_content_3 =
          <ContentBox titleName={auditTitle} bottomButton={
            <FormItem className='btnControl' {...btnformItemLayout}>
              <Button loading={this.state.loading} onClick={this.onAudit} icon="save">确定审核</Button>
            </FormItem>
          } >
                <Form className="search-form">
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout}
                                label="审核结果"
                            >
                              {getFieldDecorator('auditStatus', {
                                initialValue: '',
                                rules: [{ required: true, message: '请选择审核状态!' }],
                              })(
                                <Select>
                                  {this.state.order_audit_status.filter(a =>
                                    //if(1==1){
                                      //分部审核
                                    //}
                                    this.props.orgType == 1 ?
                                      (a.value == 7 || a.value == 6)
                                    : this.props.orgType == 2 ?
                                      (a.value == 7 || a.value == 4)
                                    :
                                      (a.value == 7 || a.value == 2)

                                  ).map((item, index) => {
                                    return <Option value={item.value} key={index}>{item.title}</Option>
                                  })}
                                </Select>
                              )}
                           </FormItem>
                        </Col>
                        <Col span={12}>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout24}
                                label="审核意见"
                            >
                              {getFieldDecorator('auditReason', {
                                initialValue: '',
                                rules: [{ required: true, message: '请输入审核意见!' }],
                              })(
                                <TextArea rows={4}/>
                              )}
                           </FormItem>
                        </Col>
                    </Row>
                </Form>
            </ContentBox>
        let block_content = <div>
            {block_content_0}
            {block_content_1}
            {block_content_2}
            {this.props.isAudit ? block_content_3 : ''}
        </div>

        return block_content;
    }
}
//表单组件 封装
const WrappedAuditContent = Form.create()(AuditContent);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //let branchId = state.auth.currentUser.userType.orgId;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getOrderById: bindActionCreators(getOrderById, dispatch),
        auditOrder: bindActionCreators(auditOrder, dispatch),
        queryMaxDiscountQuotaByItems: bindActionCreators(queryMaxDiscountQuotaByItems, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAuditContent);
