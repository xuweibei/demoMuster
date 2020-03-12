/**
 * （总部）退费退学财务申请详细信息
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
const dateFormat = 'YYYY-MM-DD';
//详细金额类表
import ChangeDetailInfo from './changeDetailInfoIndex'

import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split, formatMoney, formatMoment, timestampToTime, convertTextToHtml } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { getCourseStudentRefundHeadquartersManagerById } from '@/actions/course';
import FileDownloader from '@/components/FileDownloader';

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
    onCancel = () => {
        this.props.viewCallback();
    }

    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let confir = values.confirmDate;
                if(!confir){
                    message.warning('请选择确认日期!');
                    return;
                }
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据
                
                if (this.props.editMode == 'Audit') {
                    // values.refundDate = formatMoment(values.refundDate,'YYYY-MM-DD HH:mm:ss');//退费时间
                    values.confirmDate = formatMoment(confir);//确认时间
                    this.props.viewCallback({ studentChangeId: this.state.dataModel.studentChangeId, ...values });
                }else{
                    values.operateDate = formatMoment(confir);//确认时间
                    this.props.viewCallback({ studentChangeId: this.state.dataModel.studentChangeId, ...values });
                }
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}退费退学确认详细信息`;
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>确认</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
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
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }
    
    onEndChange = (value) => {
        this.onChange('endValue', value);
    }
    
    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open });
    }
    
    onChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    }
    render() {
        let title = this.getTitle();
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        let stageArry = [];
        switch (this.props.editMode) {
            case "View":
            case "Audit":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            <Col span={24}>
                                <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold",color: 'red'}}>订单信息</p>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="订单号">
                                    {this.state.dataModel.oldOrderSn}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学生姓名">
                                    {this.state.dataModel.oldStudentName}
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
                                <FormItem {...searchFormItemLayout} label="补退费金额(¥)">
                                <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.productAddRefundAmount)}</span>
                                    &nbsp;&nbsp;&nbsp;
                                <a onClick={() => {
                                        this.setState({ showList: true })
                                    }}
                                    >查看明细</a>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="临时缴费金额退费(¥)">
                                <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.paidRefundAmount)}</span>
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="此次总退费金额(¥)">
                                <span style={{ color: 'red' }}> {formatMoney(this.state.dataModel.refundAmountTotal)}</span>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="申请类型">
                                    {this.state.dataModel.changeTypeName}
                                </FormItem>
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
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学生户名">
                                    {this.state.dataModel.studentBankAccountName} 
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学生银行账号">
                                    {this.state.dataModel.studentBankAccountNo} 
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学生开户行">
                                    {this.state.dataModel.studentBankName} 
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
                            
                            {/* {this.props.editMode == 'Audit' && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="此次审核结果"
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
                            } */}
                            {/* {this.props.editMode == 'Audit' && <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="此次审核意见"
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
                            } */}
                            {(this.props.editMode=='Edit'|| this.props.editMode=='Audit') && <div>
                                    <Col span={24}>
                                        <p style={{paddingLeft:20,paddingBottom:10,fontWeight:"bold"}}>请进行财务确认：</p>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem {...searchFormItemLayout} label="确认日期">
                                        {getFieldDecorator('confirmDate', {
                                                initialValue: dataBind(timestampToTime(this.state.dataModel.confirmDate), true),
                                                rules: [{
                                                required: true, message: '请选择日期!',
                                                }],
                                            })(
                                                <DatePicker
                                                disabledDate={this.props.disabledEndDate}
                                                format={dateFormat}
                                                onChange={this.onEndChange}
                                                open={this.state.endOpen}
                                                onOpenChange={this.handleEndOpenChange}
                                                placeholder='确认日期'
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={12}></Col>
                                </div>
                            }
                        </Row>
                    </Form>
                );
                break;
        }


        return (
            <div>
                {!this.state.showList && <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
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
                                this.setState({ showList: false })
                            }} icon="rollback">返回</Button>
                        </Col>
                    </Row>
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
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
