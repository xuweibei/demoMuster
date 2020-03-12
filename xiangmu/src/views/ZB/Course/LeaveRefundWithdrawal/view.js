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
import { getCourseStudentRefundHeadquartersManagerById } from '@/actions/course';
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

    
    columns = [{
        title: '商品名称',
        dataIndex: 'regionName',
        fixed: 'left',
        width: 120
    },
    {
        title: '子商品名称',
        dataIndex: 'createDate',
        width: 120,
        render: text => <span>{timestampToTime(text)}</span>
    },

    {
        title: '授课类型',
        dataIndex: 'studentName',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '是否赠送',
        dataIndex: 'orderSn',
        render: (text, record, index) => {
            return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewOrderDetail', record); }}>{text}</a>
            </span>
        }
    },
    {
        title: '旧订单是否存在',
        dataIndex: 'classTyepName',
    },
    {
        title: '商品标准价格(￥)',
        dataIndex: 'totalAmount',
        render: (text, record, index) => {
            return formatMoney(record.totalAmount);
        }
    },
    {
        title: '当前商品优惠金额(￥)',
        dataIndex: 'paidAmount',
        render: (text, record, index) => {
            return formatMoney(record.paidAmount);
        }
    },
    {
        title: '当前商品实际价格(￥)',
        dataIndex: 'refundAmount',
        render: (text, record, index) => {
            return formatMoney(record.refundAmount);
        }
    },
    {
        title: '退费订单转入新订单金额(￥)',
        dataIndex: 'changeTypeName',
    },
    {
        title: '核算后商品实际价格(￥)',
        dataIndex: 'status',
    },
    {
        title: '核算后商品标准金额(￥)',
        dataIndex: 'status',
    },
    {
        title: '核算后商品优惠金额(￥)',
        dataIndex: 'status',
        width:'200',
        fixed:'right'
    }
    ];
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
    render() {
        let title = this.getTitle();
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        let stageArry = [];
        let extendButtons = [];
        extendButtons.push(<Button onClick={()=>this.onSubmit()}>确认</Button>)
        extendButtons.push(<Button onClick={()=>this.onCancel()}>取消</Button>)
        switch (this.props.editMode) {
            case "View":
            case "Audit":
            
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={24}>
                                <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold",color: 'red'}}>订单信息</p>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label='订单号'>
                                <a onClick={() => {
                                            this.setState({ orderNum: true,mange:true })
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
                                <FormItem {...searchFormItemLayout} label="补退费金额(¥)">
                                <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productAddRefundAmount)}</span>
                                    &nbsp;&nbsp;&nbsp;
                                <a onClick={() => {
                                        this.setState({ showList: true,mange:true })
                                    }}
                                    >查看明细</a>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="临时缴费退费金额(¥)">
                                <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.paidRefundAmount)}</span>
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="此次总退费金额(¥)">
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
                            }
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请类型">
                                <span style={{ color: 'red' }}> {formatMoney(this.state.dataModel.refundAmountTotal)}</span>
                                </FormItem>
                            </Col> 
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
                                    &nbsp;&nbsp;
                                    { (this.props.editMode == 'Audit' && this.state.dataModel.proposerMobile) && '手机：'+ this.state.dataModel.proposerMobile }
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
                                this.props.editMode == 'Audit' && <div>
                                    <Col span={24}>
                                        <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold"}}>请进行财务确认:</p>
                                    </Col>  
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="确认日期">
                                            {timestampToTime(this.state.dataModel.confirmDate)}
                                        </FormItem>
                                    </Col> 
                                </div>
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
                <ContentBox titleName={'退费退学财务确认'} bottomButton={this.renderBtnControl(extendButtons)}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
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
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
