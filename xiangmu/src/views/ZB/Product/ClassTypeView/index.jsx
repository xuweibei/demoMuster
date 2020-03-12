import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox } from 'antd';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';
import { getDictionaryTitle, getViewEditModeTitle, dataBind,split } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';

//业务接口方法引入
import { getClassList, editClass, addClass } from '@/actions/base';
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class ClassTypeView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            itemIds:props.currentDataModel.itemIds,
        };

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
              
                this.props.viewCallback({  ...values,classTypeId:this.state.dataModel.classTypeId , itemIds: Array.isArray(values.itemIds)?values.itemIds.join(','):values.itemIds});//合并保存数据
            }
        });
    }
    onChange = (checkedValues) => {
        if (checkedValues)
         this.state.itemIds = checkedValues.join(',')
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}班型管理`;
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
                    <Form>

                        <FormItem
                            {...searchFormItemLayout}
                            label="班型名称"
                        >
                            {getFieldDecorator('classTypeName', {
                                initialValue: this.state.dataModel.classTypeName,
                                rules: [{
                                    required: true, message: '请输入班型名称!',
                                }],
                            })(
                                <Input placeholder='请输入班型名称' style={{width:380}}/>
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="协议类型"
                        >
                            {getFieldDecorator('studyAgreementId', {
                                initialValue: dataBind(this.state.dataModel.studyAgreementId),
                                rules: [{
                                    required: true, message: '请选择协议类型!',
                                }],
                            })(
                                <Select style={{width:180}}>
                                    <Option value=''>--请选择协议类型--</Option>
                                    {this.props.dic_StudyAgreement.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="状态"
                        >
                            {getFieldDecorator('state', { initialValue: dataBind(this.state.dataModel.state) })(
                                <Select style={{width:180}}>
                                    <Option value="">全部</Option>
                                    {this.props.dic_Status.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="班型类型"
                        >
                            {getFieldDecorator('classTypeType', { 
                                initialValue: dataBind(this.state.dataModel.classTypeType),
                                rules: [{
                                    required: true, message: '请选择班型类型!',
                                }],
                            })(
                                <Select style={{width:180}}>
                                    <Option value="">--请选择班型类型--</Option>
                                    {this.props.class_type_type.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="合作项目"
                        >
                            {getFieldDecorator('itemIds', {
                                initialValue:dataBind(split(this.state.dataModel.itemIds)),
                                rules: [{
                                    required: true, message: '请选择合作项目!',
                                }],
                            })(
                                   <SelectItem scope='all' hideAll={false} showCheckBox={true} />

                                )}
                        </FormItem>

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

const WrappedClassTypeView = Form.create()(ClassTypeView);
export default WrappedClassTypeView;
