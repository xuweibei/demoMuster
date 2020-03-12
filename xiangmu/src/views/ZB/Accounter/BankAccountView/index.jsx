import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import EditablePartnerTagGroup from '@/components/EditablePartnerTagGroup';
import AreasSelect from '@/components/AreasSelect';
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';

const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

const CheckboxGroup = Checkbox.Group;
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class BankAccountView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            disable: props.currentDataModel.payeeName == '共管账户' || props.currentDataModel.payeeName == null ? false : true,
            partner_list: [],
        };

    }
    onCancel = () => {
        this.props.viewCallback();
    }
    componentWillMount() {

    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                if (!this.state.disable) values.partnerId = values.partnerId[0].id;
                if (this.props.editMode == 'Edit') {
                    this.props.viewCallback({ bankAccountId: this.state.dataModel.bankAccountId, ...values });//合并保存数据
                } else {
                    this.props.viewCallback({ ...values });//合并保存数据
                }

            }
        });
    }


    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}公司账户`;
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


    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        JSON.stringify(this.state.dataModel)
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form >
                        <Row>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="账户类型"
                                >
                                    {getFieldDecorator('payeeType', {
                                        initialValue: dataBind(this.state.dataModel.payeeType),
                                        rules: [{
                                            required: true, message: '请选择账户类型!',
                                        }],
                                    })(
                                        <Select onChange={(value, option) => {
                                            if (option.props.children == '共管账户') {
                                                this.setState({ disable: false })
                                                this.props.form.setFieldsValue({
                                                    zbPayeeType: '',
                                                });

                                            } else {
                                                let a = this.props.payee_type.find(a => a.title == option.props.children);
                                                this.setState({ disable: true })
                                                this.props.form.setFieldsValue({
                                                    zbPayeeType: a.value,
                                                });
                                                this.props.form.resetFields(['payeeType']);
                                            }
                                        }}>
                                            <Option value=''>-请选择账户类型-</Option>
                                            {this.props.payee_type.filter((a) => a.title != '大客户收费').map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}

                                </FormItem>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="公司"
                                >
                                    {getFieldDecorator('zbPayeeType', {
                                        initialValue: dataBind(this.state.dataModel.zbPayeeType),
                                        rules: [{
                                            required: true, message: '请选择公司!',
                                        }],
                                    })(
                                        <Select disabled={this.state.disable}>
                                            <Option value=''>--请选择公司--</Option>
                                            {this.props.pos_account_type.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}

                                </FormItem>
                            </Col>
                            {!this.state.disable && <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="相关大客户"
                                >
                                    {getFieldDecorator('partnerId', {
                                        initialValue: (this.props.editMode == 'Create' || this.state.dataModel.partnerId == null ? [] : [{ id: this.state.dataModel.partnerId, name: this.state.dataModel.partnerName }]),//dataBind(this.state.dataModel.branchId)
                                        rules: [{
                                            required: true, message: '请选择相关大客户!',
                                        }],
                                    })(
                                        <EditablePartnerTagGroup maxTags={1} />

                                        )}

                                </FormItem>
                            </Col>
                            }

                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="账户名"
                                >
                                    {getFieldDecorator('bankAccountName', {
                                        initialValue: this.state.dataModel.bankAccountName,
                                        rules: [{
                                            required: true, message: '请选择账户名!',
                                        }],
                                    })(
                                        <Input placeholder='请输入账户名' />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="开户行"
                                >
                                    {getFieldDecorator('bankName', {
                                        initialValue: this.state.dataModel.bankName,
                                        rules: [{
                                            required: true, message: '请输入开户行!',
                                        }],
                                    })(
                                        <Input placeholder='请输入开户行' />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="公司账号"
                                >
                                    {getFieldDecorator('bankAccountNo', {
                                        initialValue: this.state.dataModel.bankAccountNo,
                                        rules: [{
                                            required: true, message: '请输入公司账号!',
                                        }],
                                    })(
                                        <Input placeholder='请输入公司账号' />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="状态"
                                >
                                    {getFieldDecorator('status', {
                                        initialValue: dataBind(this.state.dataModel.status),
                                        rules: [{
                                            required: true, message: '请选择状态!',
                                        }],
                                    })(
                                        <Select>
                                            <Option value=''>--请选择状态--</Option>
                                            {this.props.dic_Status.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所在省及城市"
                                >
                                    {getFieldDecorator('city', {
                                        initialValue: this.state.dataModel.city,

                                    })(
                                        <AreasSelect
                                            value={this.state.dataModel.areaId}
                                            areaName={this.state.dataModel.city}
                                            valueType='name'
                                        />
                                        )
                                    }

                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="开户行网点"
                                >
                                    {getFieldDecorator('bankBranch', {

                                        initialValue: this.state.dataModel.bankBranch,

                                    })(
                                        <Input placeholder='请输入开户行网点' />
                                        )}
                                </FormItem>
                            </Col>
                        </Row>

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

const WrappedBankAccountView = Form.create()(BankAccountView);

const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedBankAccountView);
