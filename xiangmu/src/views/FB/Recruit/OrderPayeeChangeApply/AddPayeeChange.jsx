//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal, DatePicker } from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';
//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, formatMoney, formatMoment } from '@/utils';

//业务接口方法引入
import { addOrderPayeeChangeList, addOrderPayeeChange } from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectArea from '@/components/BizSelect/SelectArea';


class AddPayeeChangeView extends React.Component {

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
            dataModel: props.currentDataModel,//数据模型
            editMode: '',//Edit,Create,View,Delete
            pagingSearch: {
                currentPage: 1,
                pageSize: 10,
                regionId: '',
                payeeType: '1'
            },
            data_list: [],
            totalRecord: 0,
            loading: false,
            UserSelecteds: [],
            isShowDelete: false,
        };
    }
    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['dic_Status','payee_type']);
        //首次进入搜索，加载服务端字典项内容
        this.onSearch();
    }
    componentWillUnMount() {
    }


    //table 输出列定义
    columns = [
        {
            title: '订单区域',
            width:150,
            fixed:'left',
            dataIndex: 'benefitRegionName'
        },
        {
            title: '订单号',
            dataIndex: 'orderSn'
        },
        {
            title: '学生姓名',
            width: 100,
            dataIndex: 'realName'
        },
        {
            title: '大客户名称',
            dataIndex: 'orgName',
            //render: text => <span>{formatMoney(text, 2)}</span>
        },
        {
            title: '收费方',
            dataIndex: 'payeeTypeStr',
        },
        {
            title: '订单金额(¥)',
            dataIndex: 'totalAmount',
            render: text => <span>{formatMoney(text, 2)}</span>
        },
        {
            title: '订单类型',
            dataIndex: 'orderType',
            render: (text, record, index) => {
              if(record.orderType == 1){
                return <span>个人订单</span>
              }else{
                if(record.partnerClassType == 1){
                  return <span>大客户方向班</span>
                }else{
                  return <span>大客户精英班</span>
                }
              }
            }
        },
        {
            title: '订单创建日期',
            dataIndex: 'createDateStr',
            width:120,
            fixed:'right',
        },
        
      ];


    onSave = () => {

        this.setState({ isShowChange: true });

        
    }

    onChangeDate=()=>{

        this.props.form.validateFields((err, values) => {

            if(!err){

                let condition = {
                    orderIds: this.state.UserSelecteds.join(','),
                    payeeType: values.payeeType2
                }

                this.setState({ loading: true });

                this.props.addOrderPayeeChange(condition).payload.promise.then((response) => {
                    let data = response.payload.data;
                    this.setState({ loading: false })
                    if (data.state != 'success') {
                        
                        message.error(data.message);
                    }
                    else {

                        message.success('收费方变更申请成功！');

                        this.props.viewCallback();

                    }
                })
            }
            
             
        })
        
    }

    onHideModal=()=> {
        this.setState({
            isShowChange: false
        })
    }

    onCancel = () => {
        this.props.viewCallback();//合并保存数据
    }

    //检索数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        var condition = params || this.state.pagingSearch;
        let orderStartDate = condition.orderStartDate;
        if(orderStartDate){
          condition.orderStartDate = formatMoment(orderStartDate[0])
          condition.orderEndDate = formatMoment(orderStartDate[1])
        }
        this.props.addOrderPayeeChangeList(condition).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
                this.setState({ loading: false })
                message.error(data.message);
            }
            else {
                var list = data.data;
                this.setState({ UserSelecteds: [] });
                this.setState({
                    data_list: list,
                    totalRecord: data.totalRecord,
                    pagingSearch: condition,
                    loading: false
                })

            }
        })
    }


    //渲染，根据模式不同控制不同输出
    render() {

        const { getFieldDecorator } = this.props.form;
        let block_content = <div></div>
        //除查询外，其他扩展按钮数组
        let extendButtons = [];
        var rowSelection = {
            selectedRowKeys: this.state.UserSelecteds,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ UserSelecteds: selectedRowKeys })
            },
            getCheckboxProps: record => ({
                disabled: false,    // Column configuration not to be checked
            }),
        };
        block_content = (<div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
                <Form
                    className="search-form"
                >
                    <Row justify="center" gutter={24} align="middle" type="flex">

                        <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'订单区域'} >
                              {getFieldDecorator('regionId', { initialValue: this.state.pagingSearch.regionId })(
                                <SelectArea scope='my' hideAll={false} showCheckBox={false} />
                              )}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="收费方">
                                {getFieldDecorator('payeeType', {
                                    initialValue: this.state.pagingSearch.payeeType,
                                })(
                                    <Select>
                                        {this.state.payee_type.filter((a)=>a.title!='全部').filter((a)=>a.title!='大客户收费').filter((a)=>a.title!='共管账户').map((item, index) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="订单号">
                                {getFieldDecorator('orderSn', {
                                    initialValue: ''
                                })(
                                    <Input placeholder="请输入订单号"/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="学生姓名">
                                {getFieldDecorator('studentName', {
                                    initialValue: ''
                                })(
                                    <Input placeholder="请输入学生姓名"/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                             <FormItem
                                  {...searchFormItemLayout}
                                  label="订单创建日期">
                                  {getFieldDecorator('orderStartDate', { initialValue:this.state.pagingSearch.orderStartDate?[moment(this.state.pagingSearch.orderStartDate,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[]})(
                                      <RangePicker
                                      disabledDate={this.disabledStartDate}
                                      format={dateFormat}
                                      onChange={this.onStartChange}
                                      onOpenChange={this.handleStartOpenChange}
                                      style={{width:220}}  
                                      />
                                  )}
                              </FormItem>
                          </Col>
                          <Col span={12}></Col>
                    </Row>
                </Form>
            </ContentBox>
            {/* 内容分割线 */}
            <div className="space-default"></div>
            {/* 数据表格 */}
            <div className="search-result-list">
                <Table columns={this.columns} //列定义
                    loading={this.state.loading}
                    rowKey={'orderId'}
                    rowSelection={rowSelection}
                    pagination={false}
                    dataSource={this.state.data_list}//数据
                    bordered
                    scroll={{x:1300}}
                />
                <div className="space-default"></div>
                <div className="search-paging">
                    <Row justify="flex-end" align="middle" type="flex">
                        <Col span={24} className='search-paging-control'>
                            <Pagination showSizeChanger
                                current={this.state.pagingSearch.currentPage}
                                defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                onShowSizeChange={this.onShowSizeChange}
                                onChange={this.onPageIndexChange}
                                showTotal={(total) => { return `共${total}条数据`; }}
                                total={this.state.totalRecord} />
                        </Col>
                    </Row>
                    <div className="space-default"></div>
                    <Row justify="center" align="middle" type="flex">
                        {this.state.UserSelecteds.length ? <Button onClick={this.onSave} icon="save">变更申请</Button> : <Button disabled onClick={this.onSave} icon="save">变更申请</Button>}
                        <div className="split_button"></div>
                        <Button onClick={this.onCancel} icon="rollback">返回</Button>
                    </Row>
                </div>
            </div>
            {
              this.state.isShowChange &&
                <Modal
                visible={this.state.isShowChange}
                onOk={this.onChangeDate}
                onCancel={this.onHideModal}
                closable={false}
                //okText="确认"
                //cancelText="取消"
                >
                    <Form>
                        <Row gutter={24}>
                        <Col span={24}><span style={{marginLeft:'5px',marginBottom:'18px',display:'inline-block'}}>请选择需要变更为的收费方</span></Col>
                        <Col span={12}>
                            <FormItem {...searchFormItemLayout} label="收费方">
                                {getFieldDecorator('payeeType2', {
                                    initialValue: '',
                                    rules: [{
                                        required: true, message: '请选择收费方!',
                                    }],
                                })(
                                    <Select>
                                        {this.state.payee_type.filter((a)=>a.title!='全部').filter((a)=>a.title!='大客户收费').filter((a)=>a.title!='共管账户').filter((a)=>a.value!=this.state.pagingSearch.payeeType).map((item, index) => {
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                            </FormItem>
                        </Col>
                        <Col span={12}></Col>
                        <Col span={24}>
                                <span style={{marginLeft:'5px'}}>请确认</span>
                        </Col>
                        </Row>
                    </Form>
                </Modal>
            }
        </div>);


        return block_content;
    }
}
//表单组件 封装
const WrappedAddPayeeChangeView = Form.create()(AddPayeeChangeView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        //各业务接口
        addOrderPayeeChangeList: bindActionCreators(addOrderPayeeChangeList, dispatch),
        addOrderPayeeChange: bindActionCreators(addOrderPayeeChange, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAddPayeeChangeView);
