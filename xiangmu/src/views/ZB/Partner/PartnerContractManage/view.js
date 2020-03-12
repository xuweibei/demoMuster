import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination,
    Tree, Card, Checkbox, DatePicker, Upload
} from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, formatMoment, split } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectPartnerOrg from '@/components/BizSelect/SelectPartnerOrg'
import FileUploader from '@/components/FileUploader';
import { getPartnerContractById } from '@/actions/partner';
import { searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import { env } from '@/api/env';
const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option, OptGroup } = Select;
const CheckboxGroup = Checkbox.Group

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class PartnerContractView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            contractFileList: [],
            shortContractFile: [],
            endOpen: false,
        };
        (this: any).onBeginChange = this.onBeginChange.bind(this);
        (this: any).onEndChange = this.onEndChange.bind(this);
    }
    componentWillMount() {
        if (this.props.currentDataModel.partnerContractId) {
            this.props.getPartnerContractById(this.props.currentDataModel.partnerContractId).payload.promise.then((response) => {
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
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                var postData = {
                    contractTypes: values.contractTypes.join(','),
                    signDate: formatMoment(values.signDate),
                    endDate: formatMoment(values.endDate),
                    partnerContractId: this.state.dataModel.partnerContractId,
                }
                this.props.viewCallback({ ...values, ...postData, });//合并保存数据
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}大客户合同`;
    }

    onBeginChange(date, dateString) {
      this.state.dataModel.signDate = dateString;
    }
    onEndChange(date, dateString) {
      this.state.dataModel.endDate = dateString;
    }
    disabledBeginDate = (startValue) => {
      const endValue = this.state.dataModel.endDate;
      if (!startValue || !endValue) {
        return false;
      }
      return startValue.valueOf() > (new Date(endValue)).valueOf();
    }
    disabledEndDate = (endValue) => {
      const startValue = this.state.dataModel.signDate;
      if (!endValue || !startValue) {
        return false;
      }
      return endValue.valueOf() <= (new Date(startValue)).valueOf();
    }
    handleBeginOpenChange = (open) => {
      if (!open) {
        this.setState({ endOpen: true });
      }
    }
    handleEndOpenChange = (open) => {
      this.setState({ endOpen: open });
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
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form >
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="合同名称"
                                >
                                    {getFieldDecorator('partnerContractName', {
                                        initialValue: this.state.dataModel.partnerContractName,
                                        rules: [{
                                            required: true, message: '请输入合同名称!',
                                        }],
                                    })(
                                        <Input />
                                        )}
                                </FormItem>
                            </Col>

                            {this.props.editMode == 'Create' && <Col span={12}>

                                <FormItem
                                    {...searchFormItemLayout}
                                    label="大客户名称"
                                >
                                    {getFieldDecorator('partnerId', {
                                        initialValue: dataBind(this.state.dataModel.partnerId),
                                        rules: [{
                                            required: true, message: '请选择大客户名称!',
                                        }],
                                    })(
                                        <SelectPartnerOrg scope={'my'} hideAll={true}
                                            onSelectChange={(value, selectedOptions) => {
                                                this.state.dataModel.partnerType = selectedOptions.partnerType;
                                                this.state.dataModel.department = selectedOptions.department;
                                                this.setState({ dataModel: this.state.dataModel })
                                            }}
                                        />
                                        )}
                                </FormItem>
                            </Col>
                            }

                            {this.props.editMode == 'Edit' && <Col span={12}>

                                <FormItem
                                    {...searchFormItemLayout}
                                    label="大客户名称"
                                >
                                    {this.state.dataModel.partnerName}
                                </FormItem>
                            </Col>
                            }

                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="合作高校/企业"
                                >
                                    {getDictionaryTitle(this.props.partnertype, this.state.dataModel.partnerType)}
                                </FormItem>

                            </Col>

                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="院系"
                                >
                                    {this.state.dataModel.department}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="签约日期"
                                >
                                    {getFieldDecorator('signDate', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.signDate), true),
                                        rules: [{
                                            required: true, message: '请选择签约日期!',
                                        }],
                                    })(
                                        <DatePicker
                                            placeholder='签约日期'
                                            disabledDate={this.disabledBeginDate}
                                            format={dateFormat}
                                            onChange={this.onBeginChange}
                                            onOpenChange={this.handleBeginOpenChange}
                                        />
                                        )}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="合同截止日期"
                                >
                                    {getFieldDecorator('endDate', {
                                        initialValue: dataBind(timestampToTime(this.state.dataModel.endDate), true),
                                        rules: [{
                                            required: true, message: '请选择合同截止日期!',
                                        }],
                                    })(
                                        <DatePicker
                                            placeholder='结束日期'
                                            disabledDate={this.disabledEndDate}
                                            format={dateFormat}
                                            onChange={this.onEndChange}
                                            onOpenChange={this.handleEndOpenChange}
                                            open={this.state.endOpen}
                                        />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem
                                    { ...searchFormItemLayout24}
                                    style={{ paddingRight: 18 }}

                                    label={'合同类型'} >
                                    {getFieldDecorator('contractTypes',
                                        {
                                            initialValue: dataBind(split(this.state.dataModel.contractTypes)),
                                            rules: [{
                                                required: true, message: '请选择合同类型!',
                                            }],
                                        }
                                    )(
                                        <CheckboxGroup>
                                            {
                                                this.props.contracttype.map((item, index) => {
                                                    return <Checkbox value={item.value} key={index}>{item.title}</Checkbox>
                                                })
                                            }
                                        </CheckboxGroup>
                                        )}
                                </FormItem>
                            </Col>

                            <Col span={24}>
                                <FormItem
                                    { ...searchFormItemLayout24}
                                    style={{ paddingRight: 18 }}

                                    label={'合作项目'} >
                                    {getFieldDecorator('itemIds',
                                        {
                                            initialValue: dataBind(this.state.dataModel.itemIds),
                                            rules: [{
                                                required: true, message: '请选择合作项目!',
                                            }],
                                        }
                                    )(
                                        <SelectItem scope='my' hideAll={false} showCheckBox={true} />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label='完整版合同'>
                                    {getFieldDecorator('contractFile', {
                                        initialValue: '',
                                    })(
                                        <FileUploader />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label='简版合同'>
                                    {getFieldDecorator('shortContractFile', {
                                        initialValue: '',
                                    })(
                                        <FileUploader />
                                        )}
                                </FormItem>
                            </Col>


                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="合同备注"
                                >
                                    {getFieldDecorator('remark', {
                                        initialValue: this.state.dataModel.remark,
                                        rules: [{
                                            required: false, message: '合同备注!',
                                        }],
                                    })(
                                        <TextArea rows={4} />
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

const WrappedPartnerContractView = Form.create()(PartnerContractView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        getPartnerContractById: bindActionCreators(getPartnerContractById, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedPartnerContractView);
