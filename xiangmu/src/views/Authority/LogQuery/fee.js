/*
订单缴费
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Button, Icon, DatePicker,
  Checkbox, message, Table, Select, Radio } from 'antd';
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
import NumericInput from '@/components/NumericInput';
import EditForm from '@/components/EditForm';
import { env } from '@/api/env';
import { loadBizDictionary,searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

const dateFormat = 'YYYY-MM-DD';
import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney } from '@/utils';
import { getOrderById, paymentByPos, queryOrderByPayment } from '@/actions/recruit';
import { loadDictionary } from '@/actions/dic';
import { getFeeQrCode } from '@/actions/base';
import { paymentByHistory } from '@/actions/admin';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class FeeEdit extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
          dataModel: props.currentDataModel || {},//数据模型
          endOpen: false,
          dic_item_list: [],
          //studentId: props.studentId

          iFrameHeight: '300px',
          isShowQrCodeModal: false,
      };
      //(this: any).onBeginChange = this.onBeginChange.bind(this);
      //(this: any).onEndChange = this.onEndChange.bind(this);
      (this: any).onSubmit = this.onSubmit.bind(this);
      this.loadBizDictionary = loadBizDictionary.bind(this);
      //(this: any).fetchStudentById = this.fetchStudentById.bind(this);
      (this: any).fetchOrderFeeById = this.fetchOrderFeeById.bind(this);
      (this: any).onHideModal = this.onHideModal.bind(this);
      (this: any).onShowQrCode = this.onShowQrCode.bind(this);
      (this: any).onGetFeeQrCode = this.onGetFeeQrCode.bind(this);
      (this: any).fetchOrderPosInfoById = this.fetchOrderPosInfoById.bind(this);
    }

    componentWillMount() {
      //this.loadBizDictionary(['teach_way', 'dic_sex', 'is_study', 'reg_source']);
      //this.fetchStudentById();
      this.fetchOrderFeeById();
      this.fetchOrderPosInfoById();
    }
    fetchOrderFeeById(){
      if(this.props.orderId){
        this.props.getOrderById(this.props.orderId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
              var fee_list = [];
              fee_list.push({
                totalInitialAmount: data.data.totalInitialAmount,
                totalProductDiscountAmount: data.data.totalProductDiscountAmount,
                totalOrderDiscountAmount: data.data.totalOrderDiscountAmount,
                //totalProductAmount: data.data.totalProductAmount,
                currentPayableAmount: data.data.currentPayableAmount,
                totalAmount: data.data.totalAmount
              })
              this.setState({
                dataModel: data.data,
                fee_list: fee_list,
                term_list: data.data.orderInstalmentList
              });
            }
            else {
                message.error(data.message);
            }
        })
      }
    }
    fetchOrderPosInfoById(){
      if(this.props.orderId){
        this.props.queryOrderByPayment(this.props.orderId).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
              this.setState({
                pos_info: data.data,
              });
            }
            else {
                message.error(data.message);
            }
        })
      }
    }
    onGetFeeQrCode(){
      /*var data = {
        applicationId: 1,
        applicationKeyId: '20180109245837',
        applicationParameter: '[{"orderId":"alsdkfjaiesadlf392","orderNo":"SN_923ksaf923rsdf3","money":29087.28,"zbPayeeType":1,"feeClass":1,"isSplit":1,"bankAccountId":"abcd123456","branchId":"9817234981723asdfk"}]',
        money: 3902930.00,
        token: env.getToken()
      }*/

      var params = [{
        orderId: this.props.orderId,
        orderNo: this.state.pos_info.orderSn,
        money: this.state.pos_info.currentPayableAmount,
        zbPayeeType: this.state.pos_info.zbPayeeType,
        feeClass: this.state.pos_info.feeClass,
        isSplit: this.state.pos_info.isSplit,
        bankAccountId: this.state.pos_info.bankAccountId,
        branchId: this.state.pos_info.branchId,
        userId: this.state.pos_info.userId
      }]
      var data = {
        applicationId: env.applicationId,
        applicationKeyId: this.props.orderId,
        money: this.state.pos_info.currentPayableAmount,
        applicationParameter: JSON.stringify(params),
        payType: this.props.otherPlaceOrder ? 11 : 10, //11:异地支付
        payToken: this.state.pos_info.costToken,
      }

      this.props.getFeeQrCode(data).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.state === 'success') {
          var urlArr =  data.data.split(':');
          if(urlArr.length == 2){
            data.data = 'https:'+urlArr[1];
          }
          this.setState({
            qrCodeUrl: data.data,
            isShowQrCodeModal: true
          })
        }
        else {
            message.error(data.message);
        }
      });
      return;

      //env.getFeeQrCodeUrl
      let url = env.getFeeQrCodeUrl;
      let token = env.getToken();
      const formData = new FormData();
      formData.append('applicationId', 1);
      formData.append('applicationKeyId', '20180109245837');
      formData.append('applicationParameter', '[{"orderId":"alsdkfjaiesadlf392","orderNo":"SN_923ksaf923rsdf3","money":29087.28,"zbPayeeType":1,"feeClass":1,"isSplit":1,"bankAccountId":"abcd123456","branchId":"9817234981723asdfk"}]')
      formData.append('money', 3902930.00)
      formData.append('token', token);

      const successFn = (response) => {
        console.log(xhr.responseText);
        var data = eval('(' + xhr.responseText + ')');
        if (data.state == 'success') {
          that.setState({
            qrCodeUrl: data.data,
            isShowQrCodeModal: true
          })
        }
        else {
          message.error(data.msg);
        }
      }
      const errorFn = (response) => {
        param.error({
          msg: '生成支付二维码失败!'
        })
      }

      const xhr = new XMLHttpRequest
      //xhr.upload.addEventListener("progress", progressFn, false)
      xhr.addEventListener("load", successFn, false)
      xhr.addEventListener("error", errorFn, false)
      xhr.addEventListener("abort", errorFn, false)
      xhr.open('POST', url, true)
      xhr.send(formData)
    }

    onCancel = () => {
      this.props.viewCallback();
    }
    onSubmit = (values) => {
      //this.setState({ isShowQrCodeModal: true });
      // this.onGetFeeQrCode();
      // return;

      var that = this;
      this.props.form.validateFields((err, values) => {
        if(!err){
          that.setState({ loading: true });
          setTimeout(() => {
              that.setState({ loading: false });
          }, 3000);//合并保存数据

          var params = {
            orderId: that.props.orderId,
          }
          that.props.paymentByHistory(params).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                  message.error(data.message);
              }
              else {
                  message.success("缴费已确认成功！");
                  that.onCancel();
              }
          })
        }
      });

    }
    onShowQrCode() {
      this.setState({
        isShowQrCodeModal: true
      });
    }
    onHideModal() { 
      this.setState({
        isShowQrCodeModal: false,
      })
      this.fetchOrderFeeById();
      this.fetchOrderPosInfoById();
    }

    //----------费用-----------//
    columns_fee = [
      {
          title: '订单标准金额（¥）',
          dataIndex: 'totalInitialAmount',
          render: text => <span>{formatMoney(text)}</span>
      },
      {
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
          render: text => <span>{formatMoney(text)}</span>
      }
    ];
    //----------分期付款-----------//
    columns_term = [
      {
          title: '分期',
          dataIndex: 'term',
          render: text => <span>第{text}期</span>
      },
      {
          title: '分期缴费金额',
          dataIndex: 'payableAmount',
          render: text => <span>{formatMoney(text)}</span>
      },
      {
          title: '缴费日期',
          dataIndex: 'payableDate',
          render: text => <span>{timestampToTime(text)}</span>
      },
      {
          title: '开通科目',
          //dataIndex: 'courseCategoryNames',
          render: (text, record) => {
            var _list = [];
            record.orderInstalmentCategoryList.map(i => {
              _list.push(i.courseCategoryName);
            })

            return <span>{_list.join('、')}</span>
          }
      }
    ];

    render() {
      let block_content = <div></div>
      const { getFieldDecorator } = this.props.form;
      block_content = (
        <Form>
          <Row gutter={24}>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="姓　名">
                {this.state.dataModel.realName}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="证件号码">
                {this.state.dataModel.certificateNo}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem {...searchFormItemLayout} label="订单号">
                {this.state.dataModel.orderSn}
              </FormItem>
            </Col>
            <Col span={12}></Col>
          </Row>
          <Row gutter={24} className='formTitle'>
            <div className='block_content' style={{margin:'10px auto'}}>
              <span>订单费用汇总及分期设置：</span>
            </div>
          </Row>
          <Row gutter={24}>
            <div className='block_content' style={{margin:'0 auto'}}>
              <div className="search-result-list">
                <Table columns={this.columns_fee} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.fee_list}//数据
                    bordered
                />
              </div>
            </div>
          </Row>
          <Row gutter={24}>
            <div className='block_content' style={{margin:'0 auto'}}>
              <div className="search-result-list">
                <Table columns={this.columns_term} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.term_list}//数据
                    bordered
                />
              </div>
            </div>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <FormItem {...searchFormItemLayout24} label="订单备注">
                {getFieldDecorator('applyReason', {
                  initialValue: this.state.dataModel.applyReason,
                })(
                  <TextArea rows={4}/>
                  )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <div className='block_content' style={{margin:'0 auto'}}>
                <span style={{color:"red"}}>
                  当前应缴金额（¥） ：{formatMoney(this.state.dataModel.currentPayableAmount)}          收费方：{this.state.dataModel.payeeTypeStr}
                </span>
              </div>
            </Col>
          </Row>
        </Form>
      )

      return (
        <ContentBox titleName={"历史订单缴费确认"} bottomButton={
          <FormItem className='btnControl' {...btnformItemLayout}>
            <Button onClick={this.onSubmit} icon="save" type="primary">确认缴费</Button>
            <span className="split_button"></span>
            <Button onClick={this.onCancel} icon="rollback">返回</Button>
          </FormItem>
        }>
          <div className="dv_split"></div>
          {block_content}
          <div className="dv_split"></div>


            {
              this.state.isShowQrCodeModal &&
              <Modal
                title="Pos机扫码支付"
                visible={this.state.isShowQrCodeModal}
                onCancel={this.onHideModal}
                footer={null}
                width={370}
                height={400}
              >
                <iframe
                    style={{ overflow:'visible'}}
                    ref="iframe"
                    //src="http://192.168.0.161:8080/edu/qrcode/payQrcode?payCode=sldiwe923402394"
                    src = {this.state.qrCodeUrl}
                    width="100%"
                    //height={this.state.iFrameHeight}
                    height="100%"
                    scrolling="no"
                    frameBorder="0"
                />
              </Modal>
            }

        </ContentBox>
      );
    }
}

const WrappedView = Form.create()(FeeEdit);

const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    let branchId = state.auth.currentUser.userType.orgId;
    return {
        Dictionarys,
        menus: state.menu.items,
        branchId
    }
};

function mapDispatchToProps(dispatch) {
    return {
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      getOrderById: bindActionCreators(getOrderById, dispatch),
      paymentByPos: bindActionCreators(paymentByPos, dispatch),
      paymentByHistory: bindActionCreators(paymentByHistory, dispatch),
      getFeeQrCode: bindActionCreators(getFeeQrCode, dispatch),
      queryOrderByPayment: bindActionCreators(queryOrderByPayment, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
