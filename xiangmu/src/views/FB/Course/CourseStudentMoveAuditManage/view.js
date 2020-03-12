/**
 * （总部）转班财务申请详细信息
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
    Table, Pagination, Card, Radio, message, Checkbox, Cascader
} from 'antd';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
//详细金额类表
import ChangeDetailInfo from './changeDetailInfoIndex'

import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split, formatMoney, timestampToTime,convertTextToHtml } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { orgBranchList, allUniversityList, getUserList } from '@/actions/admin';
import { getCourseStudentMoveHeadquartersManagerById } from '@/actions/course';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};



class CourseStudentMoveAuditManageView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel:
            { ...props.currentDataModel, stageList: [] }
        };
    }
    componentWillMount() {
        if (this.props.currentDataModel.studentChangeId) {
            this.props.getCourseStudentMoveHeadquartersManagerById({ studentChangeId: this.props.currentDataModel.studentChangeId }).payload.promise.then((response) => {
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
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据
                 
                if (this.props.editMode == 'Audit') {
                    this.props.viewCallback({ studentChangeId: this.state.dataModel.studentChangeId, ...values });
                }
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}转班申请详细信息`;
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
            switch (this.props.editMode) {
                case "View":
                case "Audit":
                this.state.dataModel.stageList.map((item, index) => {
                    let block_1 = <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={`第${item.term}期应缴金额(¥)`}>
                            {formatMoney(item.payableAmount)}
                        </FormItem>
                    </Col>
                    let block_2 = <Col span={12}>
                        <FormItem {...searchFormItemLayout} label={`${item.term}期欠缴金额(¥)`}>
                            {formatMoney(item.unpaidAmount)}
                        </FormItem>
                    </Col>
                    stageArry.push(block_1);
                    stageArry.push(block_2);
                });
                    block_content = (
                        <Form>
                            <Row gutter={24}>
                                <Col span={24}>
                                <span style={{ color: 'red' }}>转出订单信息：</span>
                        </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="转出订单号">
                                        {this.state.dataModel.oldOrderSn}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="学生姓名">
                                        {this.state.dataModel.oldStudentName}
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
                                    <FormItem {...searchFormItemLayout} label="已退费金额(¥)：">
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
                                    <FormItem {...searchFormItemLayout} label="转入新订单金额(¥)">
                                        <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.transferToNewOrderAmount)}</span>
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                <span style={{ color: 'red' }}>转入新订单信息</span>
                        </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="转入新订单订单号">
                                        {this.state.dataModel.newOrderSn}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="学生姓名">
                                        {this.state.dataModel.newStudentName}
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <FormItem {...searchFormItemLayout24} label="订单收费方">
                                        {this.state.dataModel.newGetMoneyPerson}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="订单标准金额(¥)">
                                        {formatMoney(this.state.dataModel.orderStandardAmount)}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="优惠金额(¥)">
                                        {formatMoney(this.state.dataModel.discountAmount)}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="订单实际金额(¥)">
                                        {formatMoney(this.state.dataModel.newOrderActualMoney)}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="已缴金额(¥)：">
                                        {formatMoney(this.state.dataModel.newAlreadyPaid)}
                                    </FormItem>
                                </Col>
                                {/* 遍历分期期数 */}
                                {stageArry}
                                
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="转入新订单缴费金额(¥)"> 
                                        <span style={{ color: 'red' }}>{formatMoney(this.state.dataModel.email)}</span>
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    以下为申请审核情况
                                </Col>
                                {this.props.editMode == 'View' && <Col span={24}>
                                    <FormItem {...searchFormItemLayout24} label="申请人/申请日期">
                                        {timestampToTime(this.state.dataModel.proposerDate)}
                                        &nbsp;&nbsp;
                                        {this.state.dataModel.proposer}
                                    </FormItem>
                                </Col>
                                }
                                {this.props.editMode == 'View' && <Col span={24}>
                                    <FormItem {...searchFormItemLayout24} label="审核情况">
                                        <span className="ant-form-text" dangerouslySetInnerHTML={{ __html: convertTextToHtml(this.state.dataModel.auditReason) }}></span>
                                    </FormItem>
                                </Col>
                                }
                                {this.props.editMode == 'Audit' && <Col span={24}>
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
                                }
                                {this.props.editMode == 'Audit' && <Col span={24}>
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
                                            <TextArea rows={4} />
                                            )}
                                    </FormItem>
                                </Col>
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
const WrappedManage = Form.create()(CourseStudentMoveAuditManageView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        getCourseStudentMoveHeadquartersManagerById: bindActionCreators(getCourseStudentMoveHeadquartersManagerById, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
