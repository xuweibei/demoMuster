/**
 * （总部）退费退学审核详细信息
 * 2018-5-31
 * suicaijiao
 */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Card, Radio, message, Checkbox, Cascader, DatePicker
} from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
//详细金额类表
import ChangeDetailInfo from './changeDetailInfoIndex'

import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split, formatMoney, formatMoment, timestampToTime, convertTextToHtml } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { getCourseStudentRefundHeadquartersManagerById,CheckDetails } from '@/actions/course';
import FileDownloader from '@/components/FileDownloader';
//订单详情
import OrderDetailView from '@/components/DetailOrderContentBox/TabsOrderContents';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};


class CourseStudentRefundHeadquartersManagerView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            DetailsMain:[],
            dataModel:
            { ...props.currentDataModel, stageList: [] }
        };
    }
    componentWillMount() {
        if (this.props.currentDataModel.studentChangeId) {
            this.props.getCourseStudentRefundHeadquartersManagerById({ studentChangeId: this.props.currentDataModel.studentChangeId }).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.state === 'success') {
                    this.setState({
                        dataModel: data.data
                    })
                }
            });
        }
    }

    
    
    renderContent = (value, row, index) => {
        const obj = {
        children: value,
        props: {},
        };
        if (index === this.index_last) {
        obj.props.colSpan = 0;
        }
        return obj;
    };
    //table 输出列定义
    columns = [{
        title: '商品名称',
        dataIndex: 'productName', 
        width: 150,
        render: (text, record, index) => {
          if (index < this.index_last) {
            return <span>{text}</span>
          }
          return {
            children: <span>合计：</span>,
            props: {
              colSpan: 5,
            },
          }
        }
    },

    {
        title: '子商品名称',
        dataIndex: 'courseProductName', 
        render: this.renderContent,
    },
    {
        title: '授课类型',
        dataIndex: 'teachModeName', 
        render: this.renderContent,
    },
    {
        title: '是否赠送',
        dataIndex: 'isGive',  
        render: (text, record, index) => {
          return this.renderContent(getDictionaryTitle(this.state.dic_YesNo, text), record, index)
        }
    },
    {
        title: '旧订单是否存在',
        dataIndex: 'isExistsOldOrder', 
        render: (text, record, index) => {
          return this.renderContent(getDictionaryTitle(this.state.dic_YesNo, text), record, index)
        }
    },
    {
        title: '商品标准价格(￥)',
        dataIndex: 'initialPrice', 
        render: (text, record, index) => {
          if (index < this.index_last) {
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.DetailsMain.orderCourseProductRefundVoList.map(item => {
            amount += parseFloat(item.initialPrice || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '当前商品优惠金额(￥)',
        dataIndex: 'discountAmount', 
        render: (text, record, index) => {
          if (index < this.index_last) {
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.DetailsMain.orderCourseProductRefundVoList.map(item => {
            amount += parseFloat(item.discountAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '当前商品实际价格(￥)',
        dataIndex: 'productAmount', 
        render: (text, record, index) => {
          if (index < this.index_last) {
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.DetailsMain.orderCourseProductRefundVoList.map(item => {
            amount += parseFloat(item.productAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '退费订单转入新订单金额(￥)',
        dataIndex: 'inNewOrderAmount',
        render: (text, record, index) => {
          if (index < this.index_last) {
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.DetailsMain.orderCourseProductRefundVoList.map(item => {
            amount += parseFloat(item.inNewOrderAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '核算后商品实际价格(￥)',
        dataIndex: 'calcuProductAmount',
        render: (text, record, index) => {
          if (index < this.index_last) {
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.DetailsMain.orderCourseProductRefundVoList.map(item => {
            amount += parseFloat(item.calcuProductAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '核算后商品标准金额(￥)',
        dataIndex: 'calcuInitialPrice',
        render: (text, record, index) => {
          if (index < this.index_last) {
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.DetailsMain.orderCourseProductRefundVoList.map(item => {
            amount += parseFloat(item.calcuInitialPrice || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    },
    {
        title: '核算后商品优惠金额(￥)',
        dataIndex: 'calcuDiscountAmount', 
        render: (text, record, index) => {
          if (index < this.index_last) {
            return <span>{formatMoney(text)}</span>
          }
          var amount = 0;
          this.state.DetailsMain.orderCourseProductRefundVoList.map(item => {
            amount += parseFloat(item.calcuDiscountAmount || 0);
          })
          amount = Math.round(amount*100)/100;
          return <span>{formatMoney(amount)}</span>
        }
    }];
    onCancel = () => {
        this.props.viewCallback();
    }

    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据

                if (this.props.editMode == 'Audit') {
                    // values.refundDate = formatMoment(values.refundDate,'YYYY-MM-DD HH:mm:ss');//退费时间
                    this.props.viewCallback({ studentChangeId: this.state.dataModel.studentChangeId, ...values });
                }
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}退费退学详细信息`;
    }
    onViewCallback = () => {
        this.setState({
            orderNum:false,
            mange:false,
            student:false
        })
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
    //查看课程明细
    CheckTheCourseDetails = () =>{  
        this.setState({loading:true})
        this.props.CheckDetails({ studentChangeId: this.props.currentDataModel.studentChangeId }).payload.promise.then((response) => {
            let data = response.payload.data; 
            if(data.state == 'success'){
                data.data.orderCourseProductRefundVoList.push({});
                this.index_last = data.data.orderCourseProductRefundVoList.length - 1;
                this.setState({
                    DetailsMain:data.data,
                    details: true,
                    mange:true
                }) 
            }else{
                message.error(data.msg)
            }
            this.setState({loading:false})
        })
    }
    render() {
        let title = this.getTitle();
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        let stageArry = [];
        switch (this.props.editMode) {
            case "View":
            case "Audit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={24}>
                                <p><span style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold",color: 'red'}}>{this.state.dataModel.changeTypeName}申请</span>信息审核</p>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label={(this.props.editMode == 'View'?this.state.dataModel.changeTypeName:'')+'订单号'}>
                                <a onClick={() => {
                                            this.setState({ orderNum: true,mange:true,isNew:false })
                                        }}>{this.state.dataModel.oldOrderSn}</a>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学生姓名">
                                    <a onClick={() => {
                                        this.setState({ student: true,mange:true })
                                    }}>{this.state.dataModel.oldStudentName}</a>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="手机号">
                                    {this.state.dataModel.proposerMobile}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="订单实际金额(¥)">
                                    {formatMoney(this.state.dataModel.oldOrderActualMoney)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="收费方">
                                    {this.state.dataModel.oldGetMoneyPerson}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="已缴金额(¥)">
                                    {formatMoney(this.state.dataModel.oldOrderActualMoney)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="课程缴费金额(¥)">
                                    {formatMoney(this.state.dataModel.productPaidAmount)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="临时缴费金额(¥)">
                                    {formatMoney(this.state.dataModel.paymentBalance)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="扣费金额(¥)">
                                    {formatMoney(this.state.dataModel.productDeductAmount)}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="补扣费金额(¥)">
                                    {formatMoney(this.state.dataModel.productAddDeductAmount)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="扣费返还金额(¥)">
                                    {formatMoney(this.state.dataModel.productAddReturnAmount)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="已退费金额(¥)">
                                    {formatMoney(this.state.dataModel.productRefundAmount)}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请课程退费金额(¥)">
                                <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productAddRefundAmount)}</span>
                                    &nbsp;&nbsp;&nbsp;
                                <a onClick={() => {
                                        this.setState({ showList: true,mange:true })
                                    }}
                                    >查看明细</a>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请临时缴费退费金额(¥)">
                                <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.paidRefundAmount)}</span>
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请退费总金额(¥)">
                                <span style={{ color: 'red' }}> {formatMoney(this.state.dataModel.refundAmountTotal)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}> 
                            </Col>
                            {
                                this.state.dataModel.changeTypeName == "退费" ? this.props.editMode == 'View' ? <Col span={24}>
                                        <FormItem {...searchFormItemLayout24} label="退费时间">
                                            {timestampToTime(this.state.dataModel.oldOperateDate)}
                                        </FormItem>
                                    </Col>
                                    :
                                '' : ""
                                // <Col span={12}>
                                //     <FormItem {...searchFormItemLayout} label={'退费时间'} >
                                //         {getFieldDecorator('refundDate', {
                                //             initialValue: dataBind(timestampToTime(this.state.dataModel.refundDate, true), true),
                                //                 rules: [{
                                //                 required: true, message: '请选择退费时间!',
                                //             }]
                                //             })(
                                //             <DatePicker
                                //                 className="ant-calendar-picker_time"
                                //                 format="YYYY-MM-DD HH:mm:ss"
                                //                 showTime={{ format: 'HH:mm:ss' }}
                                //                 placeholder='退费时间'
                                //             />
                                //         )}
                                //     </FormItem>
                                // </Col>
                            } 
                            {
                                this.state.dataModel.changeTypeName == "退费" ? <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="匹配新订单">
                                    <a onClick={() => {
                                            this.setState({ orderNum: true,mange:true,isNew:true })
                                        }}>{this.state.dataModel.newOrderSn}</a>
                                        &nbsp;&nbsp;&nbsp;
                                    <a onClick={() => {
                                            this.CheckTheCourseDetails() 
                                        }}
                                        >查看课程明细</a>
                                    </FormItem>
                                </Col> : ''
                            }
                            {(this.state.dataModel.filePath != '' && this.state.dataModel.filePath != null) && <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label='附件'>
                                    <div style={{ marginBottom: 20 }}>
                                        <FileDownloader
                                            apiUrl={'/edu/file/getFile'}//api下载地址
                                            method={'post'}//提交方式
                                            options={{ filePath: this.state.dataModel.filePath }}
                                            title={'下载附件'}
                                        >
                                        </FileDownloader>
                                    </div>

                                </FormItem>
                            </Col>
                            }
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="申请人/申请日期：">
                                    {this.state.dataModel.proposer}
                                    &nbsp;&nbsp;
                                    {timestampToTime(this.state.dataModel.proposerDate)}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold"}}>以下为申请审核情况：</p>
                            </Col>  
                            <Col span={24}>
                                <FormItem {...searchFormItemLayout24} label="审核情况">
                                    <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditReason) }}></span>
                                </FormItem>
                            </Col>
                            {
                               (this.props.editMode == 'View' && ( this.props.currentDataModel.statusNum == 1 || this.props.currentDataModel.statusNum == 3 || this.props.currentDataModel.statusNum == 5 || this.props.currentDataModel.statusNum == 7 || this.props.currentDataModel.statusNum == 9)) && <div>
                                    <Col span={24}>
                                        以下为申请审核进度
                                    </Col>
                                    {
                                        <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="当前审核状态"> 
                                            {
                                                this.state.dataModel.auditMsg
                                            }
                                                {/* {!this.state.dataModel.auditOrgType ? '未审核' : this.state.dataModel.auditOrgType == 1 ? '总部审核通过' : '分部审核通过'} */}
                                            </FormItem>
                                        </Col>
                                    }
                                    {
                                        this.state.dataModel.auditNextOrgType && <Col span={12}>
                                            <FormItem {...searchFormItemLayout} label="下一级审核状态">
                                            {
                                                this.state.dataModel.auditNextMsg
                                            }
                                                {/* {this.state.dataModel.auditNextOrgType == 1 ? '待总部审核' : '待分部审核'} */}
                                            </FormItem>
                                        </Col>
                                    }
                                    <Col span={24}></Col>
                                </div>
                            }
                            {this.props.editMode == 'Audit' && 
                            <Col span={24}>
                                <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold"}}>请进行审核:</p>
                            </Col>  }
                            {this.props.editMode == 'Audit' && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="审核结果"
                                >
                                    {getFieldDecorator('isPass', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请选择审核结果!',
                                        }],
                                    })(
                                        <RadioGroup>
                                            <Radio value={1} key={1}>审核通过</Radio>
                                            <Radio value={0} key={2}>审核不通过</Radio>
                                        </RadioGroup>
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {this.props.editMode == 'Audit' && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="审核意见"
                                >
                                    {getFieldDecorator('auditReason', {
                                        initialValue: '',
                                        rules: [{
                                            required: true, message: '请输入此次审核意见!',
                                        }],
                                    })(
                                        <TextArea placeholder='请输入此次审核意见' rows={4} />
                                        )}
                                </FormItem>
                            </Col>
                            }
                            {
                                this.props.editMode == 'View' && <div>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="财务确认情况">
                                            {this.state.dataModel.financeStatusName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="财务确认人">
                                            {this.state.dataModel.financeUidName}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="财务确认日期">
                                            {timestampToTime(this.state.dataModel.confirmDate)}
                                        </FormItem>
                                    </Col>
                                </div>
                            }
                            
                        </Row>
                    </Form>
                );
                break;
        }


        return (
            <div>
                {
                    this.state.student && this.state.mange &&<StudentIndexView viewCallback={this.onViewCallback} studentId={this.props.currentDataModel.studentId} />
                }
                {
                    ( this.state.orderNum && this.state.mange ) &&  <OrderDetailView viewCallback={this.onViewCallback}
                    studentId={this.props.currentDataModel.studentId}
                    orderId={this.state.isNew ? this.state.dataModel.newOrderId : this.props.currentDataModel.orderId }
                    tab={3}
                />
                }
                {!this.state.mange && <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
                }
                {this.state.showList &&
                    <Row>
                        <Col span={24}>
                            <ChangeDetailInfo studentChangeId={this.state.dataModel.studentChangeId} />
                        </Col>
                        <Col span={24} className="center">
                            <Button onClick={() => {
                                this.setState({ showList: false,mange:false })
                            }} icon="rollback">返回</Button>
                        </Col>
                    </Row>
                }
                { this.state.details && <div>
                    <ContentBox titleName={'新订单课程信息'} >
                    <div className="dv_split"></div>
                        <Form className ='search-from'>
                            <Row gutter = {24}>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="新订单号">
                                        {this.state.DetailsMain.orderSn}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="学生姓名">
                                        {this.state.DetailsMain.studentName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="订单归属">
                                        {this.state.DetailsMain.benefitBranchName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="学生归属">
                                        {this.state.DetailsMain.studentBranchName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="订单标准金额(￥)">
                                        {this.state.DetailsMain.totalInitialAmount}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="优惠总金额(￥)">
                                        {this.state.DetailsMain.totalDiscountAmount}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="订单实际金额(￥)">
                                        {this.state.DetailsMain.totalAmount}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="收费方">
                                        {this.state.DetailsMain.payeeTypeStr}
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold"}}>退费订单转入缴费金额(￥):{this.state.DetailsMain.paidAmount}</p>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="课程商品转入缴费金额(￥)">
                                        {this.state.DetailsMain.formalTotalAmount}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="临时缴费转入缴费金额(￥)">
                                        {this.state.DetailsMain.tempTotalAmount}
                                    </FormItem>
                                </Col> 
                            </Row>
                        </Form>
                    <div className="dv_split"></div>
                </ContentBox>  
                <div className="space-default"></div>
                <div className="search-result-list">
                    <Table columns={this.columns} //列定义
                        loading={this.state.loading}
                        pagination={false}
                        dataSource={this.state.DetailsMain.orderCourseProductRefundVoList}//数据
                        bordered
                        rowKey={record => record.partnerContractId}//主键
                        scroll={{ x: 2100 }}
                    />
                    <div className="space-default"></div>
                    <div className="search-paging">
                        <Row justify="space-between" align="middle" type="flex">
                            <Col span={24} className="center">
                                <Button onClick={() => {
                                    this.setState({ details: false,mange:false })
                                }} icon="rollback">返回</Button>
                            </Col>
                        </Row>
                    </div>
                </div>
                </div>
                }
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(CourseStudentRefundHeadquartersManagerView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        getCourseStudentRefundHeadquartersManagerById: bindActionCreators(getCourseStudentRefundHeadquartersManagerById, dispatch),
        CheckDetails: bindActionCreators(CheckDetails, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
