import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, split } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import { searchFormItemLayout, searchFormItemLayout24} from '@/utils/componentExt';

//业务接口方法引入
import { getStudyRuleList, editStudyRule, addStudyRule, deleteStudyRule } from '@/actions/base';
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
class SpecialCourseUpd extends React.Component {
    constructor(props) {
        super(props)
        let dataModel = [];
        dataModel.push(props.currentDataModel)
        this.state = {
            dataModel: dataModel,//数据模型
        };
    }
    componentWillMount() {
        
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {

        let studyPeriod = document.querySelector('.ant-table-wrapper .studyPeriod').querySelector('.ant-input-number-input').value;
        if(!Number(studyPeriod)){
            message.error('学籍长度不能为空！');
            return;
        }
        if(Number(studyPeriod)*10%5 != 0){
            message.error('学籍长度非整年时，请保留一位小数且小数位只能设置成 0.5（半年）');
            return;
        }

        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({studyRuleId: this.props.currentDataModel.studyRoleId,batchId:this.props.pagingSearch.batchId,studyPeriod:Number(studyPeriod) });//合并保存数据
            }
        });
    }
    //table 输出列定义
    columns = [
        {
            title: '科目',
            dataIndex: 'courseName'
        }, 
        {
            title: '学籍长度(年)',
            dataIndex: 'studyPeriod',
            render: (text, record, index) => {
                return <InputNumber min={0} step={0.5} defaultValue={record.studyPeriod/12} className="studyPeriod"/>
            }
        }

    ];
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}特殊科目`;
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
        console.log(this.props)
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <div className="search-result-list">
                        <Form>
                            <Row gutter={24}>
                                <Col span={12}> 
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="批次">
                                        {this.props.batch.batchArrNext.batchName?this.props.batch.batchArrNext.batchName:this.props.batch.batchArrNext.props?this.props.batch.batchArrNext.props.children:''}
                                    </FormItem>
                                </Col>
                                <Col span={12}> 
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="项目">
                                        {this.props.currentDataModel.title}
                                    </FormItem>
                                </Col> 
                            </Row>
                            <Table columns={this.columns} //列定义
                                loading={this.state.loading}
                                pagination={false}
                                dataSource={this.state.dataModel}//数据
                                bordered
                            />
                        </Form>
                    </div>
                    
                );
                break;

        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <div className="studyRuleView">
                <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_editModeView}
                    <div className="dv_split"></div>
                </ContentBox>
            </div>
        );
    }
}

const WrappedSpecialCourseUpd = Form.create()(SpecialCourseUpd);
export default WrappedSpecialCourseUpd;