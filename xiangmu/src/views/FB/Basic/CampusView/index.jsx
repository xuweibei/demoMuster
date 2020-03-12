import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectUniversity from '@/components/BizSelect/SelectUniversity';
import EditableUniversityTagGroup from '@/components/EditableUniversityTagGroup';
//业务接口方法引入
import { getClassList, editClass, addClass } from '@/actions/base';
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class CampusView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            universityId:'',
            pagingSearch: {

            },
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

                values.universityId = values.universityId[0].id;
                
                if (this.props.editMode == 'Create') {
                    
                    this.props.viewCallback({ ...values });//合并保存数据
                }
                else {
                    this.props.viewCallback({ ...values, campusId: this.state.dataModel.campusId });//合并保存数据
                }

            }
        });
    }
    onChange = (checkedValues) => {
        if (checkedValues)
            this.state.itemIds = checkedValues.join(',')
    }
    onUniversityChoose(value, name) {

        var p = this.state.pagingSearch;

        if (value && value.length && value[0].id) {
            if (name == "universityId") {
                p[name] = value[0].id;
            }

        } else {
            p[name] = '';
        }
        this.setState({
            pagingSearch: p
        })
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}校区管理`;
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
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="高校名称"
                                >
                                    {getFieldDecorator('universityId', {
                                        initialValue: !this.props.currentDataModel.universityId?[]:[{
                                            id:this.props.currentDataModel.universityId,
                                            name:this.props.currentDataModel.universityName
                                        }],
                                        rules: [{
                                            required: true, message: '请选择高校名称!',
                                        }],
                                    })(
                                        //    <SelectUniversity />
                                        <EditableUniversityTagGroup maxTags={1}
                                            onChange={(value) => this.onUniversityChoose(value, 'universityId')}
                                        />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="状态"
                                >
                                    {getFieldDecorator('state', { initialValue: dataBind(this.state.dataModel.state) })(
                                        <Select>
                                            <Option value="">全部</Option>
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
                                    label="校区"
                                >
                                    {getFieldDecorator('campusName', {
                                        initialValue: this.state.dataModel.campusName,
                                        rules: [{
                                            required: true, message: '请输入校区名称!',
                                        }],
                                    })(
                                        <Input placeholder='请输入校区名称'/>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="地址"
                                >
                                    {getFieldDecorator('address', {
                                        initialValue: this.state.dataModel.address,
                                    })(
                                        <Input placeholder='请输入地址'/>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="备注"
                                >
                                    {getFieldDecorator('remark', { initialValue: this.state.dataModel.remark })(
                                        <TextArea　placeholder='请输入备注' rows={4} />
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

const WrappedCampusView = Form.create()(CampusView);
export default WrappedCampusView;
