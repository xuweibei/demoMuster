/*
学生转账上报 操作
wangwenjun
2018-05-09
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber, Avatar, Badge } from 'antd';
import moment from 'moment';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment,formatMoney } from '@/utils';
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import FileUploader from '@/components/FileUploader';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';
import { message } from "antd/lib/index";
import { env } from '@/api/env';
import {
  getTransferInfoById,
  updatePayDateByTransfer
} from '@/actions/finance';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';


const FormItem = Form.Item;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};




const dateFormat = 'YYYY-MM-DD';

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
const that = this;
class StudentTransferReportView extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      index_last:0,
      dataModel: props.currentDataModel,//数据模型

      realName: '',
      certificateNo: '',
      studentNo: '',
      data: [],
      totalAmount: 0,
    };
    this.amount = 0;
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    // this.loadBizDictionary = loadBizDictionary.bind(this);
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
    //载入需要的字典项:
    // this.loadBizDictionary(['dic_Status', 'confirm_status', 'payee_type']);
    if (this.props.editMode != 'Create') {
      this.fetch();
    } else { 
      let arr = Array.from(new Set(this.props.currentDataModel))
      this.index_last = arr.push({})-1;  
      this.state.data = arr; 
      this.state.realName = this.props.currentDataModel[0].realName;
      this.state.certificateNo = this.props.currentDataModel[0].certificateNo;
      this.state.studentNo = this.props.currentDataModel[0].studentNo;
      arr.slice(0,arr.length-1).forEach((order, index) => {
        return this.state.totalAmount = this.state.totalAmount + order.currentPayableAmount;
      })
    }
  }

  onSubmit = () => {
    //表单验证后，合并数据提交
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
              if(this.props.currentDataModel.confirmStatus != 2){
              let onOff = true;
              let id = '';
              this.state.data.slice(0,this.state.data.length-1).forEach(item=>{
                if(!item.orderPayfeeAmount && onOff){  
                  id = item.orderSn
                  onOff = false
                  return
                }
              }) 
              if(!onOff)return message.warning('订单'+id+'转账金额未设置！') 
              if(this.state.data.length<2)return message.warning('没有需要操作的订单号')
              let orderJson = this.state.data.map((item,index)=>{ 
                return {
                  orderId:item.orderId,
                  money:item.orderPayfeeAmount
                }
              }) 
               
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 3000);//合并保存数据 
              // console.log(orderJson)
              // let orderArr = this.state.data.map((item, index) => {
              //   return item.orderId;
              // })
              // if (this.props.editMode == 'Edit') {
              //   this.state.totalAmount = this.state.dataModel.money;
              // } 
              var postData = {
                payDate: formatMoment(values.payDate, 'YYYY-MM-DD HH:mm:ss'),
                orderJson:JSON.stringify(orderJson.slice(0,orderJson.length-1)),
                money: this.amount.replace(',',''),
                payfeeId: this.state.dataModel.studentPayfeeId,
              }
             }
        }  
        if(this.props.currentDataModel.confirmStatus == 2){ 
          
            if(formatMoment(values.payDate, 'YYYY-MM-DD HH:mm:ss') > this.props.currentDataModel.confirmDateStr){
              message.error('转账日期不能大于财务确认日期', 5);
              return;
            }
            this.props.updatePayDateByTransfer({payDate:formatMoment(values.payDate, 'YYYY-MM-DD HH:mm:ss'),payfeeId:this.state.dataModel.studentPayfeeId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message, 5);
            }
            else {
              message.success('修改成功')
              this.props.viewCallback(null);
              this.props.refresh();
              
            }
          })
        }else{ 
          this.props.viewCallback({ ...values, ...postData, });//合并保存数据

        }

      }
    });
  }

  onCheck = (checkedKeys, info) => {
    this.setState({ checkedKeys: checkedKeys })
  };
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys: expandedKeys,
      autoExpandParent: false,
    });
  };

  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = { payfeeId: this.state.dataModel.studentPayfeeId };
    this.props.getTransferInfoById(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        data.data.orderList.push({}) 
        this.index_last = data.data.orderList.length-1
        this.setState({
          dataModel: data.data,
          data:data.data.orderList,
          loading: false,
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  }


  onDeleteOrder = (orderId) => {
    if(this.state.data.length<=2)return message.warning('至少需要有一条订单进行操作！')
    this.state.data.splice(this.state.data.findIndex(item => item.orderId === orderId), 1);
    // this.state.totalAmount = 0;
    // this.state.data.forEach((order, index) => {
    //   return this.amount =order.currentPayableAmount;
    // });
    this.index_last = this.state.data.length-1 
    this.setState({ data: this.state.data });
  };

  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'Edit' || this.props.editMode == 'Create') {
      op = getViewEditModeTitle(this.props.editMode);
      return `${op}转账单`;
    } else {
      return '查看转账详细信息';
    }

  }
  //表单按钮处理
  renderBtnControl() {
    return <FormItem
      className='btnControl'
      {...btnsearchFormItemLayout}
    >

      {(this.props.editMode == 'Edit' || this.props.editMode == 'Create') && <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>确定</Button>}<span className="split_button"></span><Button onClick={this.onCancel} icon="rollback">返回</Button>
    </FormItem>
  }
  renderTd = (val,row,index) => {

    var amount = 0;
    
    if( row.sort && this.state.searchByDetail){
      if(row.isCut && this.state.data_list.length ){
        this.state.data_list[row.key].data.map(item => {
            amount += parseFloat(item[val] || 0);
        })
      }else{
        return <span>{row[val]==null ? 0 : formatMoney(row[val])}</span>
      }
    }else{
      if (index < this.index_last) {
          return <span>{row[val]==null ? 0 : formatMoney(row[val])}</span>
      }else{
        this.state.data.map(item => {
            amount += parseFloat(item[val] || 0);
        })
      }
    }

    this.amount = formatMoney(amount); 
    return <span>{formatMoney(amount)}</span>
  }
  // 订单号	班型	订单类型	收费方	订单金额（¥）	当期欠缴金额（¥）  操作
  columns = [
    {
      title: '订单号',
      fixed: 'left',
      width: 260,
      dataIndex: 'orderSn',
    },
    {
      title: '订单类型',
      dataIndex: 'orderTypeStr'
    },
    {
      title: '收费方',
      dataIndex: 'payeType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.props.payee_type, record.payeeType);
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
      render: (text, record, index) => { 
        return record.totalAmount;
      }
    },
    {
      title: '当期欠缴金额(¥)',
      dataIndex: 'currentPayableAmount',
      render: (text, record, index) => {  
        return record.currentPayableAmount
      }
    },
    {
      title: '欠缴总金额(¥)',
      dataIndex: 'currentPayableAmount1',
      render: (text, record, index) => { 
        if(this.state.data.length<=1)return ''
        if(index<this.index_last){ 
          return this.state.dataModel.currentPayableAmount;
        } 
        if(this.state.data.length<=1)return this.setState({data:[]})
        return {
          children: <span>合计：</span>,
          props: {
              colSpan: 1,
          },
      }
      }
    },
    {
      title:<div>转账金额(¥)<span style={{ color: 'red' }}>*</span></div>,
      render: (text, record, index) => { 
        if(this.state.data.length<=1)return this.setState({data:[]})
        if(index<this.index_last){ 
          if(this.props.currentDataModel.confirmStatus!=2){
              return <InputNumber value={record.orderPayfeeAmount} onChange={(value) => {
                if (isNaN(value) || value == '') {
                    record.orderPayfeeAmount = 0;
                }
                else {
                  if(parseInt(value)<0){
                    record.orderPayfeeAmount = 0;
                  }else{
                    record.orderPayfeeAmount = value
                  }
                }
                //更新价格
                this.setState({ data: this.state.data });
                // this.props.form.resetFields(['orderPayfeeAmount'])
                }} />
          }else{
            return  <InputNumber disabled = {true} value={record.orderPayfeeAmount} />
          }
        }  
        return this.renderTd('orderPayfeeAmount', record, index)
        }
        // return this.renderTd('partnerAccaAmount', record, index)
      
     },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record,index) => {
        return index<this.index_last? <DropDownButton>
        {this.props.currentDataModel.confirmStatus == 1 && <Button onClick={() => this.onDeleteOrder(record.orderId)}>删除</Button>}
        {this.props.currentDataModel.confirmStatus == 2 && <Button disabled onClick={() => this.onDeleteOrder(record.orderId)}>删除</Button>}
      </DropDownButton>:''
      },
    }
  ];

  renderDataTable = () => {
    return (<div style={{width:'90%',margin:'0 auto'}}>
      {/* 内容分割线 */}
      <div className="space-default"></div>
      <div className="search-result-list">
        <Table columns={this.columns} //列定义
          loading={this.state.loading}
          pagination={false}
          dataSource={this.state.data}//数据
          rowKey={record => record.orderId}//主键
          bordered
          scroll={{ x: 1300 }}
        />
        <div className="space-default"></div>
      </div>
    </div>
    )
  }
  viewColumns = [
    {
      title: '订单号',
      fixed: 'left',
      width: 260,
      dataIndex: 'orderSn',
    },
    {
      title: '订单类型',
      dataIndex: 'orderTypeStr'
    },
    {
      title: '收费方',
      dataIndex: 'payeType',
      render: (text, record, index) => {
        return getDictionaryTitle(this.props.payee_type, record.payeeType);
      }
    },
    {
      title: '订单金额(¥)',
      dataIndex: 'totalAmount',
      render: (text, record, index) => {
        return record.totalAmount;
      }
    },
    {
      title: '当期欠缴金额(¥)',
      dataIndex: 'currentPayableAmount',
      render: (text, record, index) => {
        return record.currentPayableAmount;
      }
    },
  ];

  renderDataViewTable = () => {
    return (<div>
      {/* 内容分割线 */}
      
      <div className="search-result-list" style={{padding:'20px'}}>
        <div className="space-default"></div>
        <Table columns={this.viewColumns} //列定义
          loading={this.state.loading}
          pagination={false}
          dataSource={this.state.data}//数据
          rowKey={record => record.orderId}//主键
          bordered
          scroll={{ x: 1300 }}
        />
      </div>
    </div>
    )
  }
  //多种模式视图处理
  renderEditModeOfView() { 
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    switch (this.props.editMode) {
      case "Create":
        let extendButtons = [];
        extendButtons.push(<Button onClick={() => {
          this.onLookView('Create', { ...this.state.dataModel })
        }} icon="plus" className="button_dark">新增转账</Button>);
        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="姓名"
                >
                  {this.state.realName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="证件号"
                >
                  {this.state.certificateNo}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学号"
                >
                  {this.state.studentNo}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="转账缴费总金额（¥）"
                >
                  {this.state.totalAmount}
                </FormItem>
              </Col>
              <Col span={12} >
                <FormItem 
                  {...searchFormItemLayout}
                  label="转账日期"
                >
                  {getFieldDecorator('payDate', {
                    initialValue: dataBind(this.state.dataModel.payDateStr, true),
                    rules: [{
                      required: true, message: '请选择转账日期日期!',
                    }],
                  })(
                    <DatePicker
                      style={{width:220}}
                      format="YYYY-MM-DD HH:mm:ss" showTime={{ format: 'HH:mm' }}
                      placeholder='转账日期'
                    />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="转账人"
                >
                  {getFieldDecorator('transferMan', {
                    initialValue: dataBind(this.state.dataModel.transferMan),
                    rules: [{
                      required: true, message: '请输入转账人!',
                    }],
                  })(
                    <Input />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...searchFormItemLayout} label='附件'>
                  {getFieldDecorator('file', {
                    initialValue: '',
                  })(
                    <FileUploader />
                    )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                    {...searchFormItemLayout}
                    label="转账流水"
                  >
                    {getFieldDecorator('transferNo', {
                      initialValue: dataBind(this.state.dataModel.transferNo),
                      rules: [{
                        required: true, message: '请输入转账流水!',
                      }],
                    })(
                      <Input />
                      )}
                  </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="备注"
                >
                  {getFieldDecorator('remark', {
                    initialValue: dataBind(this.state.dataModel.remark),
                    rules: [{
                      required: false, message: '请输入备注!',
                    }],
                  })(
                    <Input />
                    )}
                </FormItem>
              </Col>
            </Row>
            {this.renderDataTable()}
          </Form>
        );
        break;
      case "Edit":

        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="姓名"
                >
                  {this.state.dataModel.realName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="证件号"
                >
                  {this.state.dataModel.certificateNo}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学号"
                >
                  {this.state.dataModel.studentNo}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="转账缴费总金额（¥）"
                >
                  {this.state.dataModel.money}
                </FormItem>
              </Col>
              <Col span={12} >
                <FormItem
                  {...searchFormItemLayout}
                  label="转账日期"
                >
                  {getFieldDecorator('payDate', {
                    initialValue: dataBind(this.state.dataModel.payDateStr, true),
                    rules: [{
                      required: true, message: '请选择转账日期日期!',
                    }],
                  })(
                    <DatePicker
                      style={{width:220}}
                      format="YYYY-MM-DD HH:mm:ss" showTime={{ format: 'HH:mm' }}
                      placeholder='转账日期'
                    />
                    )}
                </FormItem>
              </Col>
              {
                this.props.currentDataModel.confirmStatus == 2 && <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="财务确认日期"
                >
                  {this.props.currentDataModel.confirmDateStr}
                </FormItem>
              </Col>
              }
              {this.props.currentDataModel.confirmStatus == 1 && 
                <div>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="转账人"
                    >
                      {getFieldDecorator('transferMan', {
                        initialValue: dataBind(this.state.dataModel.transferMan),
                        rules: [{
                          required: true, message: '请输入转账人!',
                        }],
                      })(
                        <Input />
                        )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...searchFormItemLayout}
                      label='附件'
                      extra={this.state.dataModel.filePath && <FileDownloader
                        apiUrl={'/edu/file/getFile'}//api下载地址
                        method={'post'}//提交方式
                        options={{ filePath: this.state.dataModel.filePath }}
                        title={'下载附件'}
                      >
                      </FileDownloader>}>
                      {getFieldDecorator('file', {
                        initialValue: dataBind(this.state.dataModel.filePath),
                      })(
                        <FileUploader />
                        )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                      <FormItem
                        {...searchFormItemLayout}
                        label="转账流水"
                      >
                        {getFieldDecorator('transferNo', {
                          initialValue: dataBind(this.state.dataModel.transferNo),
                          rules: [{
                            required: true, message: '请输入转账流水!',
                          }],
                        })(
                          <Input />
                          )}
                      </FormItem>
                </Col>
                  <Col span={24}>
                    <FormItem
                      {...searchFormItemLayout24}
                      label="备注"
                    >
                      {getFieldDecorator('remark', {
                        initialValue: dataBind(this.state.dataModel.remark),
                        rules: [{
                          required: false, message: '请输入备注!',
                        }],
                      })(
                        <Input />
                        )}
                    </FormItem>
                  </Col>
                </div>
              }
              {
                this.props.currentDataModel.confirmStatus == 2 &&
                <div>
                  <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="转账人"

                    >
                      {this.state.dataModel.transferMan}
                    </FormItem>
                  </Col>
                  {this.state.dataModel.filePath && <Col span={12}>
                    <FormItem
                      {...searchFormItemLayout}
                      label="附件"
                    >
                      <FileDownloader
                        apiUrl={'/edu/file/getFile'}//api下载地址
                        method={'post'}//提交方式
                        options={{ filePath: this.state.dataModel.filePath }}
                        title={'下载'}
                      >
                      </FileDownloader>
                    </FormItem>
                  </Col>
                  }
                  <Col span={24}>
                    <FormItem
                      {...searchFormItemLayout24}
                      label="备注"
                    >
                      {this.state.dataModel.remark}
                    </FormItem>
                  </Col>
                </div>
              }
            </Row>
            {this.renderDataTable()}
          </Form>

        );
        break;
      case "View":
        block_content = (
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="姓名"
                >
                  {this.state.dataModel.realName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="证件号"
                >
                  {this.state.dataModel.certificateNo}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="学号"
                >
                  {this.state.dataModel.studentNo}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="转账缴费总金额（¥）"
                >
                  {this.state.dataModel.money}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="转账人"

                >
                  {this.state.dataModel.transferMan}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="转账日期"
                >
                  {this.state.dataModel.payDateStr}
                </FormItem>
              </Col>
              {this.state.dataModel.filePath && <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="附件"
                >
                  <FileDownloader
                    apiUrl={'/edu/file/getFile'}//api下载地址
                    method={'post'}//提交方式
                    options={{ filePath: this.state.dataModel.filePath }}
                    title={'下载'}
                  >
                  </FileDownloader>
                </FormItem>
              </Col>
              }
              <Col span={24}>
                <FormItem
                  {...searchFormItemLayout24}
                  label="备注"
                >
                  {this.state.dataModel.remark}
                </FormItem>
              </Col>
            </Row>
            {this.renderDataViewTable()}
          </Form>
        );
        break;

    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (
      <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
        <div className="dv_split"></div>
        {block_editModeView}
        <div className="dv_split"></div>
      </ContentBox>
    );
  }
}

const WrappedStudentTransferReportView = Form.create()(StudentTransferReportView);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};
function mapDispatchToProps(dispatch) {
  return {
    getTransferInfoById: bindActionCreators(getTransferInfoById, dispatch),
    updatePayDateByTransfer: bindActionCreators(updatePayDateByTransfer, dispatch),
    // loadDictionary: bindActionCreators(loadDictionary, dispatch),
  };

}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedStudentTransferReportView);
